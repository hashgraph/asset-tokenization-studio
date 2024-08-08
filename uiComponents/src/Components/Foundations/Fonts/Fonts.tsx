import { Global } from "@emotion/react";
import React from "react";

import Inter from "./fonts/Inter-VariableFont_slnt,wght.ttf";

export const interGlobalStyles = `
@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 900;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 800;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 700;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 600;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 500;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 300;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url(${Inter}) format("opentype");
  font-weight: 200;
  font-style: normal;
}

`;

export const InterFonts = () => <Global styles={interGlobalStyles} />;
