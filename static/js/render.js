diameter = 800,
radius = diameter / 2,
innerRadius = radius - 200;

var cluster = d3.layout.cluster()
        .size([360, innerRadius])
        .sort(null)
        .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
        .interpolate("basis")
        .tension(.90)
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });

var lineStart = d3.svg.line.radial()
        .radius(function(d) { return innerRadius; })
        .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("#graph").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + (radius - 50) + "," + (radius - 50) + ")");

var mouseOverNode = function(d) {
    d3.select(this).classed("active", true );
    d3.selectAll(".link.target-" + d.key)
        .classed("target", true);

    d3.selectAll(".link.source-" + d.key)
        .classed("source", true);
};

var mouseOutNode = function(d) {
    d3.select(this).classed("active", false);
    d3.selectAll(".link.source-" + d.key)
        .classed("source", false);

    d3.selectAll(".link.target-" + d.key)
        .classed("target", false);
};

var code = {
    nodes: {},
    nodelist: [],
    links: [],
    total: 0,
    current: 0,

    getNodes: function(data) {
        var i;
        var node;
        var len = data.lines.length;
        
        diameter = Math.min(400 + len*4, 1000);
        radius = diameter/2;
        innerRadius = radius/2
        
        for (i=1; i < len; i++) {
            node = {key: i,
                    code: data.lines[i],
                    x: 360 * i / len,
                    y: innerRadius};

            // console.log(node);
              
            this.nodes[i] = node;
            this.nodelist.push(node);
        }

        return this.nodelist;
    },

    getLinks: function(data) {
        var i, link, start, end, dtheta, theta, entropy, points;
        
        this.total = data.branches.length;
        
        for (i=0; i < this.total; i++) {
            
            edge = data.branches[i]
            
            start = this.nodes[edge[0]];
            end = this.nodes[edge[1]];
            

            theta = Math.abs(start.x - end.x);
            theta = theta > 180 ? theta - 180: theta;
            
            entropy = Math.random();
            
            points = [start,
                      {x: (start.x + end.x) / 2,
                       y: innerRadius * (1 - Math.exp((theta - 180) / 180) * entropy)},
                      end];
            
            points.number = i;
            
            points.start = start.key;
            points.end = end.key;

            // console.log(points);
            
            this.links.push(points);
        }
        
        return this.links;
    }
};


$(function(){
    console.log("onload start");

    var nodes = code.getNodes(window.data),
        links = code.getLinks(window.data);

    var i;
    
    var projection = d3.geo.mercator()
    .center([radius - 50, radius - 50])
    .scale(1)
    .rotate([0,0]);
    
    var path = d3.geo.path()
    .projection(projection);

    svg.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", function(d) { return "link source-" + d.start + " target-" + d.end; })
        .attr("id", function(d) {return "secret" + d.number;})
        .attr("d", line)
        .attr("z", path);

    svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
        .append("text")
        .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
        .attr("dy", ".31em")
        .attr("id", function(d) {return d.key;})
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
        .attr("z", path)
        .text(function(d) { return d.code; })
        .on("mouseover", mouseOverNode)
        .on("mouseout",  mouseOutNode);
        
    if (diameter < 800) {
        d3.selectAll(".node text").style("font-size", "13px");
    } else {
        d3.selectAll(".node text").style("font-size", "10px");
    }

    d3.select(self.frameElement).style("height", diameter + "px");
    code.current = code.total;

    console.log("onload end");
});