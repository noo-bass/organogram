/*eslint-env browser*/
import svg2pdf from "svg2pdf.js";
import jsPDF from "jspdf-yworks";
import * as d3 from "d3";

// https://www.gnu.org/software/gv/manual/html_node/Paper-Keywords-and-paper-size-in-points.html
export var paperSizes = {
  "letter": { "width": 612, "height": 792 },
  "a0": { "width": 2384, "height": 3371 },
  "a1": { "width": 1685, "height": 2384 },
  "a2": { "width": 1190, "height": 1684 },
  "a3": { "width":  842, "height": 1190 },
  "a4": { "width":  595, "height":  842 },
  "a5": { "width":  420, "height":  595 },
};

export function maximumScale(width1, height1, width2, height2) {
  var widthScale = width2 / width1;
  var heightScale = height2 / height1;

  return d3.min([widthScale, heightScale]);
}

export function bestFit(bounding_box, width, height) {
  var bestScale = maximumScale(bounding_box.width, bounding_box.height, width, height)
  return {
    scale: bestScale * 0.98,
    translateX: (width / 2) + (((width - bounding_box.right) - bounding_box.left) / 2),
    translateY: height / 2
  };
}

export function uriPDF(document, id, paper) {
  var svgElement = document.getElementById(id);
  var max_scale;

  // create a new jsPDF instance
  var pdf = new jsPDF('l', 'pt', [paper.width, paper.height]);
  if (paper.width / paper.height <= 1) {
    // Portrait or square
    max_scale = maximumScale(svgElement.offsetWidth, svgElement.offsetHeight, paper.width, paper.height);
  } else {
    // TODO: Landscape
  }

  // render the svg element
  svg2pdf(svgElement, pdf, {
      xOffset: 0,
      yOffset: 0,
      scale: max_scale
  });

  // return the data URI
  return pdf.output('datauristring');
}

export function uriSVG(document, id) {
  var svgElement = document.getElementById(id);
  var svgContent = new XMLSerializer().serializeToString(svgElement);
  var svgBlob = new Blob(
    [
      '<?xml version="1.0" encoding="iso-8859-1"?>',
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      svgContent
    ],
    {type: "image/svg+xml"}
  );

  return URL.createObjectURL(svgBlob);
}

export function downloadPDF(document, svgId, linkId) {
  var a = document.getElementById(linkId);
  a.href = uriPDF(document, svgId, paperSizes.a4);
  a.download = "organogram.pdf";
  a.style.display = "inline-block";
}

export function downloadSVG(document, svgId, linkId) {
  var a = document.getElementById(linkId);
  a.href = uriSVG(document, svgId);
  a.download = "organogram.svg";
  a.style.display = "inline-block";
}