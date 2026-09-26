import 'dart:async';
import 'package:cross_file/cross_file.dart';

import 'video_upload_repository.dart';

/// Implementación temporal, reemplazar cuando exista el endpoint real en docs/design/video-analysis-pipeline.md §10.3.
class FakeVideoUploadRepository implements VideoUploadRepository {
  const FakeVideoUploadRepository();

  @override
  Stream<double> upload(XFile video) async* {
    for (var step = 1; step <= 10; step++) {
      await Future<void>.delayed(const Duration(milliseconds: 350));
      yield step / 10;
    }
  }
}
