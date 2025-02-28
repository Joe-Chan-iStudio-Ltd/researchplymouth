"use strict";

// Constants imported from global core
const {
    colorPackCategories: c,
    buttons: u
} = (global.Core || guac["@wsb/guac-widget-core"]).constants;

const {
    LIGHT: m,
    LIGHT_ALT: h,
    LIGHT_COLORFUL: p,
    DARK: y,
    DARK_ALT: f,
    DARK_COLORFUL: b,
    COLORFUL: S,
    MVP: x
} = (global.Core || guac["@wsb/guac-widget-core"]).constants.paintJobs;

// Mapping of treatment categories
const I = {
    [d.F]: "category-overlay",
    [d.b]: "category-overlay",
    [d.c]: "category-solid",
    [d.B]: "category-overlay",
    [d.L]: "category-overlay",
    [d.W]: "category-solid"
};

const T = d.F;

// Configuration object for header treatments
const C = {
    defaultHeaderTreatment: T,
    imageTreatments: I,
    heroContentItems: ["tagline", "tagline2", "cta"],
    nonHeroContentItems: ["phone"],
    headerTreatmentsConfig: g.i(I),
    mediaSupport: {
        [d.d]: [T],
        [d.I]: Object.keys(I),
        [d.V]: [T],
        [d.S]: [T]
    }
};

const w = x;

// Main layout configuration
const H = {
    id: "layout13",
    name: "modern",
    packs: {
        color: "005",
        font: "league-spartan"
    },
    logo: {
        font: "primary"
    },
    packCategories: {
        color: c.ACCENT,
        paintJob: w
    },
    headerProperties: {
        alignmentOption: "center"
    },
    headerTreatmentsConfig: C,
    showSlideshowTab: true,
    hasNavWithBackground: false,
    paintJobs: [m, h, p, S, b, f, y],
    defaultPaintJob: w,
    buttons: {
        primary: {
            fill: u.fills.SOLID,
            shape: u.shapes.ROUND,
            decoration: u.decorations.NONE,
            shadow: u.shadows.NONE,
            color: u.colors.PRIMARY
        },
        secondary: {
            fill: u.fills.SOLID,
            decoration: u.decorations.NONE,
            shadow: u.shadows.NONE,
            color: u.colors.PRIMARY
        },
        ...l.C
    }
};

const { SMALL_UNDERLINE: v } = l.s;

class L extends r.D {
    static get displayName() {
        return "Theme13";
    }

    static getMutatorDefaultProps(e, t) {
        const r = super.getMutatorDefaultProps(e, t);
        const a = l.W[t] || r.enableCircularImage;

        return "HEADER" === e ? {
            ...r,
            hasLogoAlign: true,
            useSlideshow: true,
            useMediaTypeSelector: true,
            showOverlayOpacityControls: true,
            hasNavBackgroundToggle: true,
            headerTreatmentsConfig: {
                ...r.headerTreatmentsConfig,
                ...H.headerTreatmentsConfig
            },
            enableVideoOverlaySlider: true
        } : {
            ...r,
            enableCircularImage: a
        };
    }

    constructor() {
        super();
        t._(this, "sharedInputStyles", {
            style: {
                borderColor: "input",
                borderRadius: "medium",
                borderStyle: "solid",
                borderWidth: "xsmall"
            }
        });

        this.mappedValues = {
            ...this.mappedValues,
            backgroundColorNavSolid() {
                return r.g(this, "background").setAlpha(25);
            },
            typographyOverrides: {
                LogoAlpha: {
                    style: {
                        font: "primary",
                        color: "highContrast",
                        fontSize: "large",
                        fontWeight: "normal",
                        letterSpacing: "normal",
                        textTransform: "none"
                    }
                },
                HeadingBeta: {
                    style: {
                        font: "primary",
                        color: "highlight",
                        fontSize: "xxlarge",
                        fontWeight: "normal",
                        letterSpacing: "normal",
                        textTransform: "none"
                    }
                },
                // Additional typography definitions...
            }
        };
    }

    // Custom methods for rendering components
    Heading(e) {
        const { tag: t } = e;
        const { widgetType: r, widgetPreset: a } = this.base;
        return super.Heading(this.merge({ style: o.g(t, r, a) }, e));
    }

    Intro(e) {
        return super.Intro(this.merge({ alignment: "center" }, e));
    }

    Phone(e) {
        return super.Phone(this.merge({
            style: {
                marginBottom: "xlarge",
                display: "inline-block",
                paddingTop: 0,
                "@md": {
                    marginBottom: "xxlarge",
                    maxWidth: "50%"
                }
            }
        }, e));
    }

    // Additional custom methods...
}

// Set configuration
t._(L, "config", H);
e.default = L;
Object.defineProperty(e, "__esModule", { value: true });

// Global assignment for compatibility
if (typeof window !== "undefined") {
    window.global = window;
}