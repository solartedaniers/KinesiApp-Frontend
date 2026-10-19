import { LAB_FONT_VARIABLES } from "@/lib/design/fonts";

// Todo lo de aquí adentro ya usa la identidad del laboratorio; el resto de la app sigue igual
export default function StyleGuideLayout({ children }: LayoutProps<"/style-guide">) {
  return (
    <div data-design="lab" className={`${LAB_FONT_VARIABLES} paper-grid min-h-dvh`}>
      {children}
    </div>
  );
}
