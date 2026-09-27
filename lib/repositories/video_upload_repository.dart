import 'package:cross_file/cross_file.dart';

/// Avance de la subida; el último evento trae el id del análisis creado.
class VideoUploadProgress {
  const VideoUploadProgress(this.fraction, {this.analysisId});

  final double fraction;
  final int? analysisId;
}

abstract interface class VideoUploadRepository {
  /// Cancelar la suscripción cancela la subida en curso.
  Stream<VideoUploadProgress> upload({
    required int athleteId,
    required XFile video,
  });
}
