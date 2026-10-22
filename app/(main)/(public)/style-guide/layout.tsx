// La guía lleva la luz ambiental de fondo; la identidad del instrumento ya la pone el layout raíz
export default function StyleGuideLayout({ children }: LayoutProps<"/style-guide">) {
  return <div className="kin-ambient min-h-dvh">{children}</div>;
}
