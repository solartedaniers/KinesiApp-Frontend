import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../core/localization/app_localizations.dart';
import '../core/theme/app_spacing.dart';

/// Reproduce un video remoto con play/pausa y barra de progreso. Sólo se
/// ocupa del ciclo de vida del [VideoPlayerController]; la URL la da quien lo usa.
class AnalysisVideoPlayer extends StatefulWidget {
  const AnalysisVideoPlayer({super.key, required this.url});

  final Uri url;

  @override
  State<AnalysisVideoPlayer> createState() => _AnalysisVideoPlayerState();
}

class _AnalysisVideoPlayerState extends State<AnalysisVideoPlayer> {
  late final VideoPlayerController _controller =
      VideoPlayerController.networkUrl(widget.url);
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _controller.initialize().then(
      (_) {
        if (mounted) setState(() {});
      },
      onError: (Object _) {
        if (mounted) setState(() => _hasError = true);
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _togglePlay() => setState(
    () =>
        _controller.value.isPlaying ? _controller.pause() : _controller.play(),
  );

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return Center(child: Text(context.tr('videoPlaybackError')));
    }
    if (!_controller.value.isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }
    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.panel),
          child: AspectRatio(
            aspectRatio: _controller.value.aspectRatio,
            child: VideoPlayer(_controller),
          ),
        ),
        VideoProgressIndicator(_controller, allowScrubbing: true),
        ValueListenableBuilder(
          valueListenable: _controller,
          builder: (context, value, _) => IconButton.filled(
            onPressed: _togglePlay,
            tooltip: context.tr(value.isPlaying ? 'videoPause' : 'videoPlay'),
            icon: Icon(value.isPlaying ? Icons.pause : Icons.play_arrow),
          ),
        ),
      ],
    );
  }
}
