import { deepmerge } from '@mui/utils';
import {
  BreakpointsOptions,
  SpacingOptions,
  createBreakpoints,
  createSpacing,
  unstable_createGetCssVar as systemCreateGetCssVar,
  colorChannel,
  unstable_styleFunctionSx as styleFunctionSx,
  SxConfig,
} from '@mui/system';
import defaultSxConfig from './sxConfig';
import colors from '../colors';
import { DefaultColorScheme, ExtendedColorScheme, SupportedColorScheme } from './types/colorScheme';
import { ColorSystem, ColorPaletteProp, Palette, PaletteOptions } from './types/colorSystem';
import { Focus } from './types/focus';
import { TypographySystemOptions, FontSize } from './types/typography';
import { Variants, ColorInversion, ColorInversionConfig } from './types/variants';
import { Theme, ThemeCssVar, ThemeScalesOptions, SxProps } from './types';
import { Components } from './components';
import { generateUtilityClass } from '../className';
import { createVariant } from './variantUtils';
import { MergeDefault } from './types/utils';

type Partial2Level<T> = {
  [K in keyof T]?: T[K] extends Record<any, any>
    ? {
        [J in keyof T[K]]?: T[K][J];
      }
    : T[K];
};

type Partial3Level<T> = {
  [K in keyof T]?: {
    [J in keyof T[K]]?: T[K][J] extends Record<any, any>
      ? {
          [P in keyof T[K][J]]?: T[K][J][P];
        }
      : T[K][J];
  };
};

export type ColorSystemOptions = Partial3Level<
  MergeDefault<ColorSystem, { palette: PaletteOptions }>
>;

// Use Partial2Level instead of PartialDeep because nested value type is CSSObject which does not work with PartialDeep.
export interface CssVarsThemeOptions extends Partial2Level<ThemeScalesOptions> {
  /**
   * Prefix of the generated CSS variables
   * @default 'joy'
   * @example extendTheme({ cssVarPrefix: 'foo-bar' })
   * // { ..., typography: { body1: { fontSize: 'var(--foo-bar-fontSize-md)' } }, ... }
   *
   * @example <caption>Provides empty string ('') to remove the prefix</caption>
   * extendTheme({ cssVarPrefix: 'foo-bar' })
   * // { ..., typography: { body1: { fontSize: 'var(--fontSize-md)' } }, ... }
   */
  cssVarPrefix?: string;
  focus?: Partial<Focus>;
  typography?: Partial<TypographySystemOptions>;
  variants?: Partial2Level<Variants>;
  colorInversion?:
    | Partial2Level<ColorInversion>
    | ((theme: Theme) => Partial2Level<ColorInversion>);
  colorInversionConfig?: ColorInversionConfig;
  breakpoints?: BreakpointsOptions;
  spacing?: SpacingOptions;
  components?: Components<Theme>;
  colorSchemes?: Partial<Record<DefaultColorScheme | ExtendedColorScheme, ColorSystemOptions>>;
  unstable_sxConfig?: SxConfig;
}

export const createGetCssVar = (cssVarPrefix = 'joy') =>
  systemCreateGetCssVar<ThemeCssVar>(cssVarPrefix);

export default function extendTheme(themeOptions?: CssVarsThemeOptions): Theme {
  const {
    cssVarPrefix = 'joy',
    breakpoints,
    spacing,
    components: componentsInput,
    variants: variantsInput,
    ...scalesInput
  } = themeOptions || {};
  const getCssVar = createGetCssVar(cssVarPrefix);

  const createLightModeVariantVariables = (color: ColorPaletteProp) => ({
    plainColor: getCssVar(`palette-${color}-600`),
    plainHoverBg: getCssVar(`palette-${color}-100`),
    plainActiveBg: getCssVar(`palette-${color}-200`),
    plainDisabledColor: getCssVar(`palette-${color}-200`),

    outlinedColor: getCssVar(`palette-${color}-500`),
    outlinedBorder: getCssVar(`palette-${color}-200`),
    outlinedHoverBg: getCssVar(`palette-${color}-100`),
    outlinedHoverBorder: getCssVar(`palette-${color}-300`),
    outlinedActiveBg: getCssVar(`palette-${color}-200`),
    outlinedDisabledColor: getCssVar(`palette-${color}-100`),
    outlinedDisabledBorder: getCssVar(`palette-${color}-100`),

    softColor: getCssVar(`palette-${color}-600`),
    softBg: getCssVar(`palette-${color}-100`),
    softHoverBg: getCssVar(`palette-${color}-200`),
    softActiveBg: getCssVar(`palette-${color}-300`),
    softDisabledColor: getCssVar(`palette-${color}-300`),
    softDisabledBg: getCssVar(`palette-${color}-50`),

    solidColor: '#fff',
    solidBg: getCssVar(`palette-${color}-500`),
    solidHoverBg: getCssVar(`palette-${color}-600`),
    solidActiveBg: getCssVar(`palette-${color}-700`),
    solidDisabledColor: `#fff`,
    solidDisabledBg: getCssVar(`palette-${color}-200`),
  });

  const createDarkModeVariantVariables = (color: ColorPaletteProp) => ({
    plainColor: getCssVar(`palette-${color}-300`),
    plainHoverBg: getCssVar(`palette-${color}-800`),
    plainActiveBg: getCssVar(`palette-${color}-700`),
    plainDisabledColor: getCssVar(`palette-${color}-800`),

    outlinedColor: getCssVar(`palette-${color}-200`),
    outlinedBorder: getCssVar(`palette-${color}-700`),
    outlinedHoverBg: getCssVar(`palette-${color}-800`),
    outlinedHoverBorder: getCssVar(`palette-${color}-600`),
    outlinedActiveBg: getCssVar(`palette-${color}-900`),
    outlinedDisabledColor: getCssVar(`palette-${color}-800`),
    outlinedDisabledBorder: getCssVar(`palette-${color}-800`),

    softColor: getCssVar(`palette-${color}-200`),
    softBg: getCssVar(`palette-${color}-900`),
    softHoverBg: getCssVar(`palette-${color}-800`),
    softActiveBg: getCssVar(`palette-${color}-700`),
    softDisabledColor: getCssVar(`palette-${color}-800`),
    softDisabledBg: getCssVar(`palette-${color}-900`),

    solidColor: `#fff`,
    solidBg: getCssVar(`palette-${color}-600`),
    solidHoverBg: getCssVar(`palette-${color}-700`),
    solidActiveBg: getCssVar(`palette-${color}-800`),
    solidDisabledColor: getCssVar(`palette-${color}-700`),
    solidDisabledBg: getCssVar(`palette-${color}-900`),
  });

  const lightColorSystem = {
    palette: {
      mode: 'light',
      primary: {
        ...colors.blue,
        ...createLightModeVariantVariables('primary'),
      },
      neutral: {
        ...colors.grey,
        plainColor: getCssVar(`palette-neutral-800`),
        plainHoverColor: getCssVar(`palette-neutral-900`),
        plainHoverBg: getCssVar(`palette-neutral-100`),
        plainActiveBg: getCssVar(`palette-neutral-200`),
        plainDisabledColor: getCssVar(`palette-neutral-300`),

        outlinedColor: getCssVar(`palette-neutral-800`),
        outlinedBorder: getCssVar(`palette-neutral-200`),
        outlinedHoverColor: getCssVar(`palette-neutral-900`),
        outlinedHoverBg: getCssVar(`palette-neutral-100`),
        outlinedHoverBorder: getCssVar(`palette-neutral-300`),
        outlinedActiveBg: getCssVar(`palette-neutral-200`),
        outlinedDisabledColor: getCssVar(`palette-neutral-300`),
        outlinedDisabledBorder: getCssVar(`palette-neutral-100`),

        softColor: getCssVar(`palette-neutral-800`),
        softBg: getCssVar(`palette-neutral-100`),
        softHoverColor: getCssVar(`palette-neutral-900`),
        softHoverBg: getCssVar(`palette-neutral-200`),
        softActiveBg: getCssVar(`palette-neutral-300`),
        softDisabledColor: getCssVar(`palette-neutral-300`),
        softDisabledBg: getCssVar(`palette-neutral-50`),

        solidColor: getCssVar(`palette-common-white`),
        solidBg: getCssVar(`palette-neutral-600`),
        solidHoverBg: getCssVar(`palette-neutral-700`),
        solidActiveBg: getCssVar(`palette-neutral-800`),
        solidDisabledColor: getCssVar(`palette-neutral-300`),
        solidDisabledBg: getCssVar(`palette-neutral-50`),
      },
      danger: {
        ...colors.red,
        ...createLightModeVariantVariables('danger'),
      },
      info: {
        ...colors.purple,
        ...createLightModeVariantVariables('info'),
      },
      success: {
        ...colors.green,
        ...createLightModeVariantVariables('success'),
      },
      warning: {
        ...colors.yellow,
        ...createLightModeVariantVariables('warning'),
        solidColor: getCssVar(`palette-warning-800`),
        solidBg: getCssVar(`palette-warning-200`),
        solidHoverBg: getCssVar(`palette-warning-300`),
        solidActiveBg: getCssVar(`palette-warning-400`),
        solidDisabledColor: getCssVar(`palette-warning-200`),
        solidDisabledBg: getCssVar(`palette-warning-50`),

        softColor: getCssVar(`palette-warning-800`),
        softBg: getCssVar(`palette-warning-50`),
        softHoverBg: getCssVar(`palette-warning-100`),
        softActiveBg: getCssVar(`palette-warning-200`),
        softDisabledColor: getCssVar(`palette-warning-200`),
        softDisabledBg: getCssVar(`palette-warning-50`),

        outlinedColor: getCssVar(`palette-warning-800`),
        outlinedHoverBg: getCssVar(`palette-warning-50`),

        plainColor: getCssVar(`palette-warning-800`),
        plainHoverBg: getCssVar(`palette-warning-50`),
      },
      common: {
        white: '#FFF',
        black: '#09090D',
      },
      text: {
        primary: getCssVar('palette-neutral-800'),
        secondary: getCssVar('palette-neutral-600'),
        tertiary: getCssVar('palette-neutral-500'),
      },
      background: {
        body: getCssVar('palette-common-white'),
        surface: getCssVar('palette-common-white'),
        popup: getCssVar('palette-common-white'),
        level1: getCssVar('palette-neutral-50'),
        level2: getCssVar('palette-neutral-100'),
        level3: getCssVar('palette-neutral-200'),
        tooltip: getCssVar('palette-neutral-800'),
        backdrop: 'rgba(255 255 255 / 0.5)',
      },
      divider: `rgba(${getCssVar('palette-neutral-mainChannel')} / 0.28)`,
      focusVisible: getCssVar('palette-primary-500'),
    },
    shadowRing: '0 0 #000',
    shadowChannel: '187 187 187',
  };
  const darkColorSystem = {
    palette: {
      mode: 'dark',
      primary: {
        ...colors.blue,
        ...createDarkModeVariantVariables('primary'),
      },
      neutral: {
        ...colors.grey,
        plainColor: getCssVar(`palette-neutral-200`),
        plainHoverColor: getCssVar(`palette-neutral-50`),
        plainHoverBg: getCssVar(`palette-neutral-800`),
        plainActiveBg: getCssVar(`palette-neutral-700`),
        plainDisabledColor: getCssVar(`palette-neutral-700`),

        outlinedColor: getCssVar(`palette-neutral-200`),
        outlinedBorder: getCssVar(`palette-neutral-800`),
        outlinedHoverColor: getCssVar(`palette-neutral-50`),
        outlinedHoverBg: getCssVar(`palette-neutral-800`),
        outlinedHoverBorder: getCssVar(`palette-neutral-700`),
        outlinedActiveBg: getCssVar(`palette-neutral-800`),
        outlinedDisabledColor: getCssVar(`palette-neutral-800`),
        outlinedDisabledBorder: getCssVar(`palette-neutral-800`),

        softColor: getCssVar(`palette-neutral-200`),
        softBg: getCssVar(`palette-neutral-800`),
        softHoverColor: getCssVar(`palette-neutral-50`),
        softHoverBg: getCssVar(`palette-neutral-700`),
        softActiveBg: getCssVar(`palette-neutral-600`),
        softDisabledColor: getCssVar(`palette-neutral-700`),
        softDisabledBg: getCssVar(`palette-neutral-900`),

        solidColor: getCssVar(`palette-common-white`),
        solidBg: getCssVar(`palette-neutral-600`),
        solidHoverBg: getCssVar(`palette-neutral-700`),
        solidActiveBg: getCssVar(`palette-neutral-800`),
        solidDisabledColor: getCssVar(`palette-neutral-700`),
        solidDisabledBg: getCssVar(`palette-neutral-900`),
      },
      danger: {
        ...colors.red,
        ...createDarkModeVariantVariables('danger'),
      },
      info: {
        ...colors.purple,
        ...createDarkModeVariantVariables('info'),
      },
      success: {
        ...colors.green,
        ...createDarkModeVariantVariables('success'),
        solidColor: '#fff',
        solidBg: getCssVar(`palette-success-600`),
        solidHoverBg: getCssVar(`palette-success-700`),
        solidActiveBg: getCssVar(`palette-success-800`),
      },
      warning: {
        ...colors.yellow,
        ...createDarkModeVariantVariables('warning'),
        solidColor: getCssVar(`palette-common-black`),
        solidBg: getCssVar(`palette-warning-300`),
        solidHoverBg: getCssVar(`palette-warning-400`),
        solidActiveBg: getCssVar(`palette-warning-500`),
      },
      common: {
        white: '#FFF',
        black: '#09090D',
      },
      text: {
        primary: getCssVar('palette-neutral-100'),
        secondary: getCssVar('palette-neutral-300'),
        tertiary: getCssVar('palette-neutral-400'),
      },
      background: {
        body: getCssVar('palette-neutral-900'),
        surface: getCssVar('palette-common-black'),
        popup: getCssVar('palette-neutral-800'),
        level1: getCssVar('palette-neutral-800'),
        level2: getCssVar('palette-neutral-700'),
        level3: getCssVar('palette-neutral-600'),
        tooltip: getCssVar('palette-neutral-600'),
        backdrop: `rgba(${getCssVar('palette-neutral-darkChannel')} / 0.5)`,
      },
      divider: `rgba(${getCssVar('palette-neutral-mainChannel')} / 0.24)`,
      focusVisible: getCssVar('palette-primary-500'),
    },
    shadowRing: '0 0 #000',
    shadowChannel: '0 0 0',
  };

  const defaultScales = {
    colorSchemes: {
      light: lightColorSystem,
      dark: darkColorSystem,
    },
    fontSize: {
      xs3: '0.5rem',
      xs2: '0.625rem',
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xl2: '1.5rem',
      xl3: '1.875rem',
      xl4: '2.25rem',
      xl5: '3rem',
      xl6: '3.75rem',
      xl7: '4.5rem',
    },
    fontFamily: {
      body: `"Public Sans", ${getCssVar('fontFamily-fallback')}`,
      display: `"Public Sans", ${getCssVar('fontFamily-fallback')}`,
      code: 'Source Code Pro,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
      fallback:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    },
    fontWeight: {
      xs: 200,
      sm: 300,
      md: 500,
      lg: 600,
      xl: 700,
      xl2: 800,
      xl3: 900,
    },
    focus: {
      thickness: '2px',
      selector: `&.${generateUtilityClass('', 'focusVisible')}, &:focus-visible`,
      default: {
        outlineOffset: `var(--focus-outline-offset, ${getCssVar('focus-thickness')})`,
        outline: `${getCssVar('focus-thickness')} solid ${getCssVar('palette-focusVisible')}`,
      },
    },
    lineHeight: {
      sm: 1.25,
      md: 1.5,
      lg: 1.7,
    },
    letterSpacing: {
      sm: '-0.01em',
      md: '0.083em',
      lg: '0.125em',
    },
    radius: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
    },
    shadow: {
      xs: `${getCssVar('shadowRing')}, 0 1px 2px 0 rgba(${getCssVar('shadowChannel')} / 0.12)`,
      sm: `${getCssVar('shadowRing')}, 0.3px 0.8px 1.1px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.11), 0.5px 1.3px 1.8px -0.6px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.18), 1.1px 2.7px 3.8px -1.2px rgba(${getCssVar('shadowChannel')} / 0.26)`,
      md: `${getCssVar('shadowRing')}, 0.3px 0.8px 1.1px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.12), 1.1px 2.8px 3.9px -0.4px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.17), 2.4px 6.1px 8.6px -0.8px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.23), 5.3px 13.3px 18.8px -1.2px rgba(${getCssVar('shadowChannel')} / 0.29)`,
      lg: `${getCssVar('shadowRing')}, 0.3px 0.8px 1.1px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.11), 1.8px 4.5px 6.4px -0.2px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.13), 3.2px 7.9px 11.2px -0.4px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.16), 4.8px 12px 17px -0.5px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.19), 7px 17.5px 24.7px -0.7px rgba(${getCssVar('shadowChannel')} / 0.21)`,
      xl: `${getCssVar('shadowRing')}, 0.3px 0.8px 1.1px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.11), 1.8px 4.5px 6.4px -0.2px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.13), 3.2px 7.9px 11.2px -0.4px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.16), 4.8px 12px 17px -0.5px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.19), 7px 17.5px 24.7px -0.7px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.21), 10.2px 25.5px 36px -0.9px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.24), 14.8px 36.8px 52.1px -1.1px rgba(${getCssVar(
        'shadowChannel',
      )} / 0.27), 21px 52.3px 74px -1.2px rgba(${getCssVar('shadowChannel')} / 0.29)`,
    },
    zIndex: {
      badge: 1,
      table: 10,
      popup: 1000,
      modal: 1300,
      tooltip: 1500,
    },
    typography: {
      display1: {
        fontFamily: getCssVar('fontFamily-display'),
        fontWeight: getCssVar('fontWeight-xl'),
        fontSize: getCssVar('fontSize-xl7'),
        lineHeight: getCssVar('lineHeight-sm'),
        letterSpacing: getCssVar('letterSpacing-sm'),
        color: getCssVar('palette-text-primary'),
      },
      display2: {
        fontFamily: getCssVar('fontFamily-display'),
        fontWeight: getCssVar('fontWeight-xl'),
        fontSize: getCssVar('fontSize-xl6'),
        lineHeight: getCssVar('lineHeight-sm'),
        letterSpacing: getCssVar('letterSpacing-sm'),
        color: getCssVar('palette-text-primary'),
      },
      h1: {
        fontFamily: getCssVar('fontFamily-display'),
        fontWeight: getCssVar('fontWeight-lg'),
        fontSize: getCssVar('fontSize-xl5'),
        lineHeight: getCssVar('lineHeight-sm'),
        letterSpacing: getCssVar('letterSpacing-sm'),
        color: getCssVar('palette-text-primary'),
      },
      h2: {
        fontFamily: getCssVar('fontFamily-display'),
        fontWeight: getCssVar('fontWeight-lg'),
        fontSize: getCssVar('fontSize-xl4'),
        lineHeight: getCssVar('lineHeight-sm'),
        letterSpacing: getCssVar('letterSpacing-sm'),
        color: getCssVar('palette-text-primary'),
      },
      h3: {
        fontFamily: getCssVar('fontFamily-body'),
        fontWeight: getCssVar('fontWeight-md'),
        fontSize: getCssVar('fontSize-xl3'),
        lineHeight: getCssVar('lineHeight-sm'),
        color: getCssVar('palette-text-primary'),
      },
      h4: {
        fontFamily: getCssVar('fontFamily-body'),
        fontWeight: getCssVar('fontWeight-md'),
        fontSize: getCssVar('fontSize-xl2'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-primary'),
      },
      h5: {
        fontFamily: getCssVar('fontFamily-body'),
        fontWeight: getCssVar('fontWeight-md'),
        fontSize: getCssVar('fontSize-xl'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-primary'),
      },
      h6: {
        fontFamily: getCssVar('fontFamily-body'),
        fontWeight: getCssVar('fontWeight-md'),
        fontSize: getCssVar('fontSize-lg'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-primary'),
      },
      body1: {
        fontFamily: getCssVar('fontFamily-body'),
        fontSize: getCssVar('fontSize-md'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-primary'),
      },
      body2: {
        fontFamily: getCssVar('fontFamily-body'),
        fontSize: getCssVar('fontSize-sm'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-secondary'),
      },
      body3: {
        fontFamily: getCssVar('fontFamily-body'),
        fontSize: getCssVar('fontSize-xs'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-tertiary'),
      },
      body4: {
        fontFamily: getCssVar('fontFamily-body'),
        fontSize: getCssVar('fontSize-xs2'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-tertiary'),
      },
      body5: {
        fontFamily: getCssVar('fontFamily-body'),
        fontSize: getCssVar('fontSize-xs3'),
        lineHeight: getCssVar('lineHeight-md'),
        color: getCssVar('palette-text-tertiary'),
      },
    },
  };

  const { colorSchemes, ...mergedScales } = scalesInput
    ? deepmerge(defaultScales, scalesInput)
    : defaultScales;

  const { palette: firstColorSchemePalette } = Object.entries(colorSchemes)[0][1];
  const variantInput = { palette: firstColorSchemePalette, cssVarPrefix, getCssVar };

  const theme = {
    colorSchemes,
    ...mergedScales,
    breakpoints: createBreakpoints(breakpoints ?? {}),
    components: deepmerge(
      {
        // TODO: find a way to abstract SvgIcon out of @mui/material
        MuiSvgIcon: {
          defaultProps: {
            fontSize: 'xl',
          },
          styleOverrides: {
            root: ({ ownerState, theme: themeProp }) => {
              const instanceFontSize = ownerState.instanceFontSize as 'inherit' | keyof FontSize;
              return {
                color: 'var(--Icon-color)',
                margin: 'var(--Icon-margin)',
                ...(ownerState.fontSize &&
                  ownerState.fontSize !== 'inherit' && {
                    fontSize: `var(--Icon-fontSize, ${
                      themeProp.vars.fontSize[ownerState.fontSize]
                    })`,
                  }),
                ...(ownerState.color &&
                  ownerState.color !== 'inherit' &&
                  ownerState.color !== 'context' &&
                  themeProp.vars.palette[ownerState.color!] && {
                    color: `rgba(${themeProp.vars.palette[ownerState.color]?.mainChannel} / 1)`,
                  }),
                ...(ownerState.color === 'context' && {
                  color: themeProp.vars.palette.text.secondary,
                }),
                ...(instanceFontSize &&
                  instanceFontSize !== 'inherit' && {
                    '--Icon-fontSize': themeProp.vars.fontSize[instanceFontSize],
                  }),
              };
            },
          },
        },
      } as Components<Theme>,
      componentsInput,
    ),
    variants: deepmerge(
      {
        plain: createVariant('plain', variantInput),
        plainHover: createVariant('plainHover', variantInput),
        plainActive: createVariant('plainActive', variantInput),
        plainDisabled: createVariant('plainDisabled', variantInput),
        outlined: createVariant('outlined', variantInput),
        outlinedHover: createVariant('outlinedHover', variantInput),
        outlinedActive: createVariant('outlinedActive', variantInput),
        outlinedDisabled: createVariant('outlinedDisabled', variantInput),
        soft: createVariant('soft', variantInput),
        softHover: createVariant('softHover', variantInput),
        softActive: createVariant('softActive', variantInput),
        softDisabled: createVariant('softDisabled', variantInput),
        solid: createVariant('solid', variantInput),
        solidHover: createVariant('solidHover', variantInput),
        solidActive: createVariant('solidActive', variantInput),
        solidDisabled: createVariant('solidDisabled', variantInput),
      },
      variantsInput,
    ),
    cssVarPrefix,
    getCssVar,
    spacing: createSpacing(spacing),
    colorInversionConfig: {
      soft: ['plain', 'outlined', 'soft', 'solid'],
      solid: ['plain', 'outlined', 'soft', 'solid'],
    },
  } as unknown as Theme; // Need type casting due to module augmentation inside the repo

  /**
   * Color channels generation
   */
  function attachColorChannels(
    supportedColorScheme: SupportedColorScheme,
    palette: Pick<Palette, ColorPaletteProp>,
  ) {
    (Object.keys(palette) as Array<ColorPaletteProp>).forEach((key) => {
      const channelMapping = {
        main: '500',
        light: '200',
        dark: '800',
      } as const;
      if (supportedColorScheme === 'dark') {
        // @ts-ignore internal
        channelMapping.main = 400;
      }
      if (!palette[key].mainChannel && palette[key][channelMapping.main]) {
        palette[key].mainChannel = colorChannel(palette[key][channelMapping.main]);
      }
      if (!palette[key].lightChannel && palette[key][channelMapping.light]) {
        palette[key].lightChannel = colorChannel(palette[key][channelMapping.light]);
      }
      if (!palette[key].darkChannel && palette[key][channelMapping.dark]) {
        palette[key].darkChannel = colorChannel(palette[key][channelMapping.dark]);
      }
    });
  }

  (
    Object.entries(theme.colorSchemes) as Array<
      [SupportedColorScheme, { palette: Pick<Palette, ColorPaletteProp> }]
    >
  ).forEach(([supportedColorScheme, colorSystem]) => {
    attachColorChannels(supportedColorScheme, colorSystem.palette);
  });

  theme.unstable_sxConfig = {
    ...defaultSxConfig,
    ...themeOptions?.unstable_sxConfig,
  };
  theme.unstable_sx = function sx(props: SxProps) {
    return styleFunctionSx({
      sx: props,
      theme: this,
    });
  };

  return theme;
}
