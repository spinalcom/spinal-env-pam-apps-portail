import Vuetify from 'vuetify/lib/framework';
import colors from 'vuetify/lib/util/colors';
import '@mdi/font/css/materialdesignicons.css';

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: colors.red.darken1, // #E53935
                secondary: colors.red.lighten4, // #FFCDD2
                accent: colors.blueGrey.darken1, // #3F51B5 blue-grey darken-1
                good: colors.teal.accent3, // #1DE9B6
                moderate: colors.yellow.lighten1, // #FFEE58
                unhealthy: colors.orange.lighten1, // #FFA726
                hazardous: colors.red.accent3, // #FF1744
                semiTransparent: colors.red.accent3, // FF1744
            },
        },
    },
    icons: {
        iconfont: 'mdi'
    },
});
