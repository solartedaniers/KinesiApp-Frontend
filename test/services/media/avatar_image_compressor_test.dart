import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/services/media/avatar_image_compressor.dart';
import 'package:image/image.dart' as img;

void main() {
  test(
    'large photo is resized and re-encoded as JPEG off the UI isolate',
    () async {
      final photo = img.encodePng(img.Image(width: 2000, height: 1000));

      final upload = await AvatarImageCompressor.compress(photo);

      expect(upload, isNotNull);
      expect(upload!.contentType, 'image/jpeg');
      final result = img.decodeJpg(upload.bytes)!;
      expect((result.width, result.height), (512, 256));
    },
  );

  test('bytes that are not an image are rejected', () async {
    expect(
      await AvatarImageCompressor.compress(Uint8List.fromList([1, 2, 3])),
      isNull,
    );
  });
}
