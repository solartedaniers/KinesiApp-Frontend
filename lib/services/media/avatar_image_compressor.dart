import 'package:flutter/foundation.dart';
import 'package:image/image.dart' as img;

import '../../models/avatar/avatar_data.dart';

/// Decodifica, redimensiona y comprime la foto de perfil en un Isolate con
/// [compute]: una foto de cámara de varios MB tarda cientos de ms en
/// procesarse y en el hilo de UI congelaría las animaciones.
abstract final class AvatarImageCompressor {
  static const int maxDimension = 512;
  static const List<int> _jpegQualities = [85, 70, 55, 40];

  /// Null si los bytes no son una imagen decodificable.
  static Future<AvatarUpload?> compress(Uint8List rawBytes) async {
    final jpeg = await compute(_encodeJpeg, rawBytes);
    return jpeg == null ? null : AvatarUpload.fromBytes(jpeg);
  }

  /// Corre dentro del Isolate: sólo recibe y devuelve bytes (copiables entre
  /// Isolates), nunca objetos de UI.
  static Uint8List? _encodeJpeg(Uint8List rawBytes) {
    final img.Image? decoded;
    try {
      decoded = img.decodeImage(rawBytes);
    } catch (_) {
      // Con bytes corruptos algunos decoders lanzan en vez de devolver null
      return null;
    }
    if (decoded == null) return null;
    // Las fotos de cámara traen la rotación en EXIF; se aplica antes de
    // redimensionar porque el JPEG final no conserva ese metadato
    var image = img.bakeOrientation(decoded);
    if (image.width > maxDimension || image.height > maxDimension) {
      image = image.width >= image.height
          ? img.copyResize(image, width: maxDimension)
          : img.copyResize(image, height: maxDimension);
    }
    // Baja la calidad hasta entrar en el límite del backend
    Uint8List? jpeg;
    for (final quality in _jpegQualities) {
      jpeg = img.encodeJpg(image, quality: quality);
      if (jpeg.length <= AvatarUpload.maxBytes) break;
    }
    return jpeg;
  }
}
