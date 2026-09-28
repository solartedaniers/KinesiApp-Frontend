import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../app/app_scope.dart';
import '../../controllers/video_recording_controller.dart';
import '../../core/config/api_config.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/navigation/analysis_flow.dart';
import '../../core/navigation/app_routes.dart';
import '../../core/theme/app_spacing.dart';
import '../../models/jump_analysis/movement_type.dart';
import '../../widgets/role_home_button.dart';

class VideoCaptureView extends StatefulWidget {
  const VideoCaptureView({super.key, required this.athleteId});
  final int athleteId;
  @override
  State<VideoCaptureView> createState() => _VideoCaptureViewState();
}

class _VideoCaptureViewState extends State<VideoCaptureView> {
  CameraController? _controller;
  // Las closures leen _controller en cada llamada: sobreviven a un reinicio de cámara
  late final VideoRecordingController _recording = VideoRecordingController(
    start: () => _controller!.startVideoRecording(),
    stop: () => _controller!.stopVideoRecording(),
    timeout: const Duration(seconds: ApiConfig.videoRecordingTimeoutSeconds),
  );
  Timer? _timer;
  int _secondsRemaining = ApiConfig.maxVideoDurationSeconds;
  MovementType _movementType = MovementType.jump;
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
    if (!await _recording.start()) return _recoverIfFailed();
    if (!mounted) return;
    setState(() => _secondsRemaining = ApiConfig.maxVideoDurationSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining <= 1) {
        timer.cancel();
        unawaited(_stopRecording());
      } else {
        setState(() => _secondsRemaining--);
      }
    });
  }

  /// Botón y temporizador llegan aquí; el controlador ignora los llamados repetidos.
  Future<void> _stopRecording() async {
    _timer?.cancel();
    final video = await _recording.stop();
    if (video != null) return _goToUpload(video);
    await _recoverIfFailed();
  }

  /// Tras un fallo o timeout del plugin, el estado nativo de la cámara no es
  /// confiable (puede seguir "grabando"): se avisa y se reabre la cámara.
  Future<void> _recoverIfFailed() async {
    if (_recording.error == null || !mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.tr('videoRecordingFailed'))));
    final previous = _controller;
    setState(() => _controller = null);
    await previous?.dispose();
    await _initialize();
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
      extra: AnalysisFlow(
        athleteId: widget.athleteId,
        video: video,
        movementType: _movementType,
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _recording.dispose();
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
                      _MovementTypeSelector(
                        value: _movementType,
                        enabled: true,
                        onChanged: (type) =>
                            setState(() => _movementType = type),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      _PickVideoButton(onPressed: _pickExistingVideo),
                    ],
                  ),
                ),
              )
            : controller == null || !controller.value.isInitialized
            ? const Center(child: CircularProgressIndicator())
            : ListenableBuilder(
                listenable: _recording,
                builder: (context, _) => _buildRecorder(context, controller),
              ),
      ),
    );
  }

  Widget _buildRecorder(BuildContext context, CameraController controller) {
    final phase = _recording.phase;
    final idle = phase == RecordingPhase.idle;
    return Column(
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
              _MovementTypeSelector(
                value: _movementType,
                enabled: idle,
                onChanged: (type) => setState(() => _movementType = type),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                context.tr('videoCaptureLateralView'),
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                '${context.tr('videoSecondsRemaining')} $_secondsRemaining',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              _RecordButton(
                phase: phase,
                onStart: _startRecording,
                onStop: _stopRecording,
              ),
              const SizedBox(height: AppSpacing.sm),
              _PickVideoButton(onPressed: idle ? _pickExistingVideo : null),
            ],
          ),
        ),
      ],
    );
  }
}

/// Iniciar / detener. Mientras el plugin inicia o finaliza el archivo queda
/// deshabilitado con un indicador: el usuario ve que algo está pasando y no
/// puede disparar una segunda operación nativa.
class _RecordButton extends StatelessWidget {
  const _RecordButton({
    required this.phase,
    required this.onStart,
    required this.onStop,
  });

  final RecordingPhase phase;
  final VoidCallback onStart;
  final VoidCallback onStop;

  @override
  Widget build(BuildContext context) {
    final (labelKey, icon, onPressed) = switch (phase) {
      RecordingPhase.idle => ('videoCaptureStart', Icons.circle, onStart),
      RecordingPhase.starting => ('videoCaptureStarting', null, null),
      RecordingPhase.recording => ('videoCaptureStop', Icons.stop, onStop),
      RecordingPhase.stopping => ('videoCaptureSaving', null, null),
    };
    return SizedBox(
      width: double.infinity,
      child: FilledButton.icon(
        onPressed: onPressed,
        icon: icon == null
            ? const SizedBox.square(
                dimension: AppSpacing.md,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(icon),
        label: Text(context.tr(labelKey)),
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

/// Salto o sentadilla. La sentadilla se sube igual, pero se avisa que todavía
/// no tiene análisis propio.
class _MovementTypeSelector extends StatelessWidget {
  const _MovementTypeSelector({
    required this.value,
    required this.enabled,
    required this.onChanged,
  });

  final MovementType value;
  final bool enabled;
  final ValueChanged<MovementType> onChanged;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      SegmentedButton<MovementType>(
        segments: [
          for (final type in MovementType.values)
            ButtonSegment(value: type, label: Text(context.tr(type.labelKey))),
        ],
        selected: {value},
        onSelectionChanged: enabled
            ? (selection) => onChanged(selection.single)
            : null,
      ),
      if (value == MovementType.squat)
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            context.tr('movementTypeSquatNotice'),
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
    ],
  );
}
