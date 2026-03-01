import { getSheetData } from './google-sheets';

export async function getThemeConfig() {
  const palette = await getSheetData('Color_Palette');
  const settings = await getSheetData('Theme_Settings');

  // Map color names to Hex codes
  const colorMap: Record<string, string> = {};
  palette.forEach((p) => {
    if (p.Color_Name && p.Hex_Code) colorMap[p.Color_Name] = p.Hex_Code;
  });

  // Helper function to extract a setting
  const getTheme = (targetPage: string, section: string, element: string, property: string, fallback: string) => {
    const setting = settings.find((s) => 
      s.Target_Page === targetPage && 
      s.Section === section && 
      s.Element === element && 
      s.Property === property
    );
    
    if (!setting || !setting.Value) return fallback;
    // If the value matches a color in the palette, return the Hex. Otherwise, return the raw value (like "24px").
    return colorMap[setting.Value] || setting.Value;
  };

  return { getTheme };
}