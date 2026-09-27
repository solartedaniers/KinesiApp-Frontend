import 'dart:convert';
import 'dart:typed_data';

import 'package:cross_file/cross_file.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/models/jump_analysis/jump_analysis_summary.dart';
import 'package:frontend/models/jump_analysis/movement_type.dart';
import 'package:frontend/repositories/dio_video_upload_repository.dart';
import 'package:frontend/services/jump_analyses/jump_analysis_api.dart';

/// Adaptador HTTP falso: guarda la última petición y responde el JSON dado.
class _RecordingAdapter implements HttpClientAdapter {
  _RecordingAdapter(this.body);

  final Map<String, dynamic> body;
  RequestOptions? lastRequest;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastRequest = options;
    await requestStream?.drain<void>();
    return ResponseBody.fromString(
      jsonEncode(body),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

Dio _dio(_RecordingAdapter adapter) =>
    Dio(BaseOptions(baseUrl: 'http://api.test/api/v1'))
      ..httpClientAdapter = adapter;

void main() {
  test(
    'videoUrl asks for a short-lived token and builds a playable URL',
    () async {
      final adapter = _RecordingAdapter({'token': 'abc.def', 'expires_at': ''});

      final url = await JumpAnalysisApi(_dio(adapter)).videoUrl(42);

      expect(adapter.lastRequest!.path, '/jump-analyses/42/video-access');
      expect(
        url.toString(),
        'http://api.test/api/v1/jump-analyses/42/video?token=abc.def',
      );
    },
  );

  test('the upload sends the chosen movement type with the video', () async {
    final adapter = _RecordingAdapter({'id': 5});
    final video = XFile.fromData(
      Uint8List.fromList([1, 2, 3]),
      name: 'squat.mp4',
      mimeType: 'video/mp4',
    );

    final events = await DioVideoUploadRepository(_dio(adapter))
        .upload(athleteId: 7, movementType: MovementType.squat, video: video)
        .toList();

    final fields = Map.fromEntries(
      (adapter.lastRequest!.data as FormData).fields,
    );
    expect(fields, {'athlete_id': '7', 'movement_type': 'squat'});
    expect(events.last.analysisId, 5);
  });

  test('movement type is parsed from the API, defaulting to jump', () {
    final json = {
      'id': 1,
      'athlete_id': 1,
      'status': 'processed',
      'risk_score': null,
      'recorded_at': '2026-09-27T10:00:00Z',
    };
    expect(
      JumpAnalysisSummary.fromJson({
        ...json,
        'movement_type': 'squat',
      }).movementType,
      MovementType.squat,
    );
    expect(JumpAnalysisSummary.fromJson(json).movementType, MovementType.jump);
  });
}
