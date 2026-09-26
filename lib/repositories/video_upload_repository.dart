import 'package:cross_file/cross_file.dart';

abstract interface class VideoUploadRepository {
  Stream<double> upload(XFile video);
}
