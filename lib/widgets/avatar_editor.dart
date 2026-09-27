import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../core/error/error_message_resolver.dart';
import '../core/localization/app_localizations.dart';
import '../core/network/api_exception.dart';
import '../models/avatar/avatar_data.dart';
import 'user_avatar.dart';

enum _AvatarAction { gallery, camera, remove }

/// Avatar con acceso a cambiar/quitar la foto (galería o cámara). Solo elige y
/// valida la imagen: quien lo usa decide a qué endpoint subirla.
class AvatarEditor extends StatefulWidget {
  const AvatarEditor({
    super.key,
    required this.name,
    required this.bytes,
    required this.onUpload,
    required this.onRemove,
    this.radius = 44,
  });

  final String name;
  final Uint8List? bytes;
  final Future<void> Function(AvatarUpload avatar) onUpload;
  final Future<void> Function() onRemove;
  final double radius;

  @override
  State<AvatarEditor> createState() => _AvatarEditorState();
}

class _AvatarEditorState extends State<AvatarEditor> {
  bool _isSaving = false;

  Future<void> _edit() async {
    final action = await showModalBottomSheet<_AvatarAction>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: Text(context.tr('avatarFromGallery')),
              onTap: () => Navigator.pop(sheetContext, _AvatarAction.gallery),
            ),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined),
              title: Text(context.tr('avatarFromCamera')),
              onTap: () => Navigator.pop(sheetContext, _AvatarAction.camera),
            ),
            if (widget.bytes != null)
              ListTile(
                leading: const Icon(Icons.delete_outline),
                title: Text(context.tr('avatarRemove')),
                onTap: () => Navigator.pop(sheetContext, _AvatarAction.remove),
              ),
          ],
        ),
      ),
    );
    if (action == null || !mounted) return;
    if (action == _AvatarAction.remove) return _save(widget.onRemove);

    // Redimensionada al elegirla: el backend acepta hasta ~1 MB
    final file = await ImagePicker().pickImage(
      source: action == _AvatarAction.gallery
          ? ImageSource.gallery
          : ImageSource.camera,
      maxWidth: 512,
      maxHeight: 512,
      imageQuality: 85,
    );
    if (file == null) return;
    final upload = AvatarUpload.fromBytes(await file.readAsBytes());
    if (upload == null) return _showError('avatarInvalid');
    await _save(() => widget.onUpload(upload));
  }

  Future<void> _save(Future<void> Function() action) async {
    setState(() => _isSaving = true);
    try {
      await action();
    } on ApiException catch (e) {
      _showError(ErrorMessageResolver.keyFor(e.code));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showError(String key) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(context.tr(key))));
  }

  @override
  Widget build(BuildContext context) => Stack(
    alignment: Alignment.center,
    children: [
      UserAvatar(name: widget.name, bytes: widget.bytes, radius: widget.radius),
      if (_isSaving) const CircularProgressIndicator(),
      Positioned(
        right: 0,
        bottom: 0,
        child: IconButton.filled(
          onPressed: _isSaving ? null : _edit,
          icon: const Icon(Icons.photo_camera_outlined, size: 18),
          tooltip: context.tr('avatarChange'),
        ),
      ),
    ],
  );
}
