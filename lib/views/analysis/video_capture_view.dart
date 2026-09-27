import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../app/app_scope.dart';
import '../../core/config/api_config.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/analysis_flow.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../widgets/role_home_button.dart';

class VideoCaptureView extends StatefulWidget {
  const VideoCaptureView({super.key, required this.athleteId});
  final int athleteId;
  @override
  State<VideoCaptureView> createState() => _VideoCaptureViewState();
}

class _VideoCaptureViewState extends State<VideoCaptureView> {
  CameraController? _controller;
  Timer? _timer;
  int _secondsRemaining = ApiConfig.maxVideoDurationSeconds;
  bool _recording = false;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _verifyConsent();
  }

  Future<void> _verifyConsent() async {
    final hasConsent = await AppScope.read(
      context,
    ).consentRepository.hasConsent(ApiConfig.consentVersion);
    if (!mounted) return;
    if (!hasConsent) {
      context.go(AppRoutes.videoConsent, extra: widget.athleteId);
      return;
    }
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) throw StateError('No camera found');
      final camera = cameras.firstWhere(
        (item) => item.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );
      final controller = CameraController(
        camera,
        ResolutionPreset.medium,
        enableAudio: false,
        fps: ApiConfig.videoCaptureFps,
        videoBitrate: ApiConfig.videoCaptureBitrate,
      );
      _controller = controller;
      await controller.initialize();
      if (mounted) setState(() {});
    } catch (error) {
      if (mounted) setState(() => _error = error);
    }
  }

  Future<void> _startRecording() async {
    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) return;
    await controller.startVideoRecording();
    setState(() => _recording = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        unawaited(_stopRecording());
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  Future<void> _stopRecording() async {
    _timer?.cancel();
    final controller = _controller;
    if (controller == null || !controller.value.isRecordingVideo) return;
    _goToUpload(await controller.stopVideoRecording());
  }

  /// Alternativa a grabar: un video del salto ya guardado en el dispositivo.
  Future<void> _pickExistingVideo() async {
    final video = await ImagePicker().pickVideo(source: ImageSource.gallery);
    if (video != null) _goToUpload(video);
  }

  void _goToUpload(XFile video) {
    if (!mounted) return;
    context.go(
      AppRoutes.videoUpload,
      extra: AnalysisFlow(athleteId: widget.athleteId, video: video),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;
    return Scaffold(
      appBar: AppBar(
        title: Text(context.tr('videoCaptureTitle')),
        actions: const [RoleHomeButton()],
      ),
      body: SafeArea(
        child: _error != null
            // Sin cámara todavía se puede analizar un video guardado
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        context.tr('videoCameraError'),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppSpacing.md),
                      _PickVideoButton(onPressed: _pickExistingVideo),
                    ],
                  ),
                ),
              )
            : controller == null || !controller.value.isInitialized
            ? const Center(child: CircularProgressIndicator())
            : Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.md,
                        AppSpacing.md,
                        AppSpacing.md,
                        0,
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(AppRadius.panel),
                        child: CameraPreview(controller),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      children: [
                        Text(
                          context.tr('videoCaptureLateralView'),
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '${context.tr('videoSecondsRemaining')} $_secondsRemaining',
                          style: Theme.of(context).textTheme.headlineSmall
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton.icon(
                            onPressed: _recording
                                ? _stopRecording
                                : _startRecording,
                            icon: Icon(_recording ? Icons.stop : Icons.circle),
                            label: Text(
                              context.tr(
                                _recording
                                    ? 'videoCaptureStop'
                                    : 'videoCaptureStart',
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        _PickVideoButton(
                          onPressed: _recording ? null : _pickExistingVideo,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

/// Botón "Subir video existente" (galería/archivos del dispositivo).
class _PickVideoButton extends StatelessWidget {
  const _PickVideoButton({required this.onPressed});

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: double.infinity,
    child: OutlinedButton.icon(
      onPressed: onPressed,
      icon: const Icon(Icons.video_library_outlined),
      label: Text(context.tr('videoPickExisting')),
    ),
  );
}
