import * as d3 from "d3";

import { bestFit, paperSizes } from "./download";
import { default as svgRenderer } from "./svg";
import { default as link } from "./link";
import { diagonal } from "./diagonal";

export default function(svgId, rows) {
  var width = paperSizes.a2.width,
      height = paperSizes.a2.height;
  var radius = d3.min([width, height]) / 2 - 100;

  var tree = d3.tree()
      .size([360, radius])
      .separation(function(a, b) { return (a.parent == b.parent ? 0.66 : 2) / a.depth; });

  var svg = svgRenderer(svgId, width, height),
      g = svg.append("g").attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

  var stratify = d3.stratify()
      .id(function(d) { return d.reference; })
      .parentId(function(d) { return d.report_to; });

  var root = tree(stratify(rows));
  link(g, root, diagonal);

  var node = g.selectAll(".node")
      .data(root.descendants())
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
      })

  node.append("circle")
      .attr("r", function(d) {
        if (isNaN(d.data.wte) || d.data.wte == 0) return 0;
        var radius = 3 * Math.sqrt(d.data.wte);
        return radius;
      })
      .attr("fill", function(d) {
        if (d.data.label == "Dis-est.") return "#ccc";
        return d.data.colour;
      })
      ;

  node.append("text")
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? "translate(6)" : "rotate(180)translate(-6)"; })
      .style("fill", function(d){
        return d.data.label_colour || "#333";
      })

  .attr("font-size", "6px")
  .attr("font-family", "sans-serif")
      .text(function(d) {
        return d.data.label
      });

  var bounding_rect = g.node().getBoundingClientRect();
  var best_fit = bestFit(bounding_rect, width, height);
  g.attr("transform", "translate(" + best_fit.translateX + "," + best_fit.translateY + ")scale(" + best_fit.scale + ")")
}