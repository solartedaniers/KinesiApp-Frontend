import 'package:flutter/material.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/network/api_exception.dart';
import '../../models/user_role.dart';
import '../../services/auth/session_controller.dart';
import '../../widgets/app_components.dart';
import '../../widgets/biometric_background.dart';
import '../dashboard/dashboard_view.dart';
import 'register_view.dart';
class LoginView extends StatefulWidget { const LoginView({super.key,required this.session,required this.language,required this.themeMode,required this.onLanguageChanged,required this.onThemeModeChanged}); final SessionController session; final AppLanguage language; final ThemeMode themeMode; final ValueChanged<AppLanguage> onLanguageChanged; final ValueChanged<ThemeMode> onThemeModeChanged; @override State<LoginView> createState()=>_LoginViewState(); }
class _LoginViewState extends State<LoginView> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignIn() async {
    setState(() => _isSubmitting = true);
    try {
      await widget.session.login(email: _emailController.text.trim(), password: _passwordController.text);
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => DashboardView(
            role: widget.session.role ?? UserRole.athlete,
            language: widget.language,
            themeMode: widget.themeMode,
            onLanguageChanged: widget.onLanguageChanged,
            onThemeModeChanged: widget.onThemeModeChanged,
          ),
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.tr('loginError'))));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context)=>Scaffold(body:BiometricBackground(child:SafeArea(child:Center(child:SingleChildScrollView(padding:const EdgeInsets.all(24),child:ConstrainedBox(constraints:const BoxConstraints(maxWidth:460),child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:[Align(alignment:Alignment.centerRight,child:Row(mainAxisSize:MainAxisSize.min,children:[IconButton(onPressed:()=>widget.onThemeModeChanged(widget.themeMode==ThemeMode.dark?ThemeMode.light:ThemeMode.dark),icon:const Icon(Icons.dark_mode_outlined)),IconButton(onPressed:()=>widget.onLanguageChanged(widget.language==AppLanguage.spanish?AppLanguage.english:AppLanguage.spanish),icon:const Icon(Icons.language))])),const AppLogo(),const SizedBox(height:16),Text(context.tr('appName'),textAlign:TextAlign.center,style:Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight:FontWeight.w900)),Text(context.tr('subtitle'),textAlign:TextAlign.center),const SizedBox(height:28),AppCard(child:Column(crossAxisAlignment:CrossAxisAlignment.stretch,children:[Text(context.tr('signIn'),style:Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight:FontWeight.bold)),const SizedBox(height:16),AppTextField(controller:_emailController,label:context.tr('email'),icon:Icons.person_outline),const SizedBox(height:12),AppTextField(controller:_passwordController,label:context.tr('password'),icon:Icons.lock_outline,obscureText:true),Align(alignment:Alignment.centerRight,child:TextButton(onPressed:(){},child:Text(context.tr('forgotPassword')))),_isSubmitting?const Padding(padding:EdgeInsets.symmetric(vertical:14),child:Center(child:CircularProgressIndicator())):PrimaryButton(label:context.tr('signIn'),icon:Icons.arrow_forward,onPressed:_handleSignIn),const SizedBox(height:8),Text(context.tr('secure'),textAlign:TextAlign.center,style:Theme.of(context).textTheme.labelSmall)])),Row(mainAxisAlignment:MainAxisAlignment.center,children:[Text(context.tr('noAccount')),TextButton(onPressed:()=>Navigator.push(context,MaterialPageRoute(builder:(_)=>RegisterView(language:widget.language,themeMode:widget.themeMode,onLanguageChanged:widget.onLanguageChanged,onThemeModeChanged:widget.onThemeModeChanged))),child:Text(context.tr('register')))])])))))));
}
