import { defineTheme } from "pinceau";

export default defineTheme({
  prose: {
    h2: {
      fontSize: "{typography.fontSize.3xl}",
      margin: "5px 0 10px",
    },
    h3: {
      fontSize: "{typography.fontSize.2xl}",
      margin: "10px 0 10px",
    },
    h4: {
      fontSize: "{typography.fontSize.lg}",
      margin: "5px 0 10px",
    },
    code:{
        block:{
            borderRadius: "{typography.radii.sm}",
        },
        inline:{
            borderRadius: "{typography.radii.2xs}"
        }
    },
    img:{
      borderRadius: "{typography.radii.sm}"
    },
    th:{
      textAlign: 'center'
    },
    p: {
      margin: '{typography.verticalMargin.base} 20px'
    },
    ul: {
      margin: '{typography.verticalMargin.base} 30px'
    }
  },
});
