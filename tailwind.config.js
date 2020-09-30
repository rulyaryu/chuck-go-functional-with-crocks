module.exports = {
    future: {
        // removeDeprecatedGapUtilities: true,
        // purgeLayersByDefault: true,
    },
    purge: [],
    theme: {
        inset: {
            '0': 0,
            '1/2': '50%',
        },
        extend: {
            keyframes: {
                'rollin': {
                    '0%': {
                        opacity: 0,
                        transform: 'translate3d(-100%,0,0)',
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateZ(0)',
                    }
                }
            },
            animation: {
                rollin: 'rollin 1s ease-in-out forwards',
            },
            spacing: {
                '1': '100%',
                '1/2': '50%',
                '3/4': '75%',
                '8/12': '66.666667%'
            }
        },
    },
    variants: {
        animation: ['responsive', 'hover'],
    },
    plugins: [],
}
