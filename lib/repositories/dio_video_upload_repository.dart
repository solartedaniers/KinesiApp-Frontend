import 'dart:async';

import 'package:cross_file/cross_file.dart';
import 'package:dio/dio.dart';

import '../core/network/api_exception.dart';
import '../core/network/api_paths.dart';
import 'video_upload_repository.dart';

/// Sube el video del salto como multipart en streaming: Dio lee el archivo
/// por bloques desde disco ([XFile.openRead]) a medida que los envía, así que
/// el video nunca se carga entero en RAM.
class DioVideoUploadRepository implements VideoUploadRepository {
  DioVideoUploadRepository(this._dio);

  final Dio _dio;

  @override
  Stream<VideoUploadProgress> upload({
    required int athleteId,
    required XFile video,
  }) {
    final cancelToken = CancelToken();
    late final StreamController<VideoUploadProgress> controller;
    controller = StreamController(
      onListen: () async {
        try {
          final analysisId = await _send(
            athleteId,
            video,
            cancelToken,
            (fraction) => controller.add(VideoUploadProgress(fraction)),
          );
          controller.add(VideoUploadProgress(1, analysisId: analysisId));
        } on DioException catch (e) {
          if (!CancelToken.isCancel(e)) {
            controller.addError(ApiException.fromDioError(e));
          }
        } finally {
          await controller.close();
        }
      },
      onCancel: () => cancelToken.cancel(),
    );
    return controller.stream;
  }

  Future<int> _send(
    int athleteId,
    XFile video,
    CancelToken cancelToken,
    void Function(double fraction) onProgress,
  ) async {
    final formData = FormData.fromMap({
      'athlete_id': athleteId,
      // Fábrica de stream (no bytes): se puede releer si hay que reintentar
      'video': MultipartFile.fromStream(
        video.openRead,
        await video.length(),
        filename: video.name,
        contentType: DioMediaType.parse(_mimeType(video)),
      ),
    });
    final response = await _dio.post<Map<String, dynamic>>(
      ApiPaths.uploadJumpVideo,
      data: formData,
      cancelToken: cancelToken,
      onSendProgress: (sent, total) {
        if (total > 0) onProgress(sent / total);
      },
    );
    return response.data!['id'] as int;
  }

  static String _mimeType(XFile video) {
    if (video.mimeType case final mimeType?) return mimeType;
    return video.name.toLowerCase().endsWith('.mov')
        ? 'video/quicktime'
        : 'video/mp4';
  }
}
