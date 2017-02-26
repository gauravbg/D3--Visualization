

// See D3 margin convention: http://bl.ocks.org/mbostock/3019563
var margin = {
    top : 20,
    right : 10,
    bottom : 100,
    left : 50
},
width = 700 - margin.right - margin.left,
height = 500 - margin.top - margin.bottom;
var radius = 175;
var dataSet;
var dragStartX = 0;
var dragEndX = 0;
var binCount = 10;
var isForceShown = 0;
var drag;


// define x and y scales
var xScale = d3.scale.linear().range([ 0, width ]);

var yScale = d3.scale.linear().range([ height, 0 ]);

// define x axis and y axis
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yAxis = d3.svg.axis().scale(yScale).orient("left");

var barPie = 0;
var selected = 0;

/*
 * -----------------------------------------------------------------------------
 * To understand how to import data. See D3 API refrence on CSV. Understand the
 * difference between .csv, .tsv and .json files. To import a .tsv or .json file
 * use d3.tsv() or d3.json(), respectively.
 * ------------------------------------------------------------------------------
 */

select();
function select(sel) {
    
    if(sel == undefined || sel.options.selectedIndex == 0) {
	d3.select("h1").text("No of Bands vs Year Formed");
	selected = 0;
    } else {
	d3.select("h1").text("No of Bands vs No of Fans");
	selected = 1;
    }
    if(barPie == 0) {
	showBar();
    } else {
	showPie();	
    }
}

function toggleBarPie() {
    if(barPie == 0) {
	barPie = 1;
	if(selected == 0) {
		d3.select("h1").text("No of Bands vs Year Formed");
	    } else {
		d3.select("h1").text("No of Bands vs No of Fans");
	    }
	showPie();
    } else {
	barPie = 0;
	showBar();
    }
}



function showBar() {
    

    var barPie = 0;
    d3.select("svg").remove();
    var svg = d3.select("body")
	.append("svg")
	.attr({	"width" : width + margin.right + margin.left,
	    	"height" : height + margin.top + margin.bottom})
	.append("g")
	.attr(	"transform",
		"translate(" + margin.left + "," + margin.right + ")");
    
    

    d3.csv("metal_bands_2017.csv", function(error, data) {
	    if (error)
		   console.log("Error: data not loaded!");
	    
	    data.forEach(function(d) {
		       d.fans = +d.fans;
		       d.origin = d.origin;
	    });


	    var yearFormed = data.map(function(i) {
		     return parseInt(i.formed);
	    })
	    
	    var fans = data.map(function(i) {
		     return parseInt(i.fans);
	    })
	    
	    
	    if(selected == 0) {
		
		console.log("IN 0");
		dataSet = d3.layout.histogram().bins(binCount)(yearFormed)

	    } else {
		
		console.log("IN ELSE");
		dataSet = d3.layout.histogram().bins(binCount)(fans)
	
	    }

	    var xMin = d3.min(dataSet, function(d) {
	        return d.x;
	    });

	    var xMax = d3.max(dataSet, function(d) {
	        return d.x;
	    });


	    var yMax = d3.max(dataSet, function(d) {
	        return d.length;
	    });

	    drag = d3.behavior.drag()
		.on("dragstart", dragStart)
		.on("dragend", dragEnd);

	    var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function(d) {
			return "<span style='color:black'>" + d.y + "</span>";
		  })
		  
	    // Specify the domains of the x and y scales
	var bandWidth = (xMax - xMin);
	    xScale.domain([ xMin - bandWidth * 0.05, xMax + bandWidth * 0.1]);
	    console.log("MINMAX: " + xMin+ "," + xMax);
	    
	    svg.call(tip);
	    d3.select("body").call(drag);
	    
	    
	    yScale.domain([ 0, yMax ]);
	    console.log("MINMAX: " + 0+ "," + yMax);
	    var barWidth = (width )/binCount;
	    
	    
	    
	    var bars = svg.selectAll(".bar")
		.data(dataSet)
		.enter()
		.append("g")
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.append('rect')
	    .attr("x", function(d) { return xScale(d.x);})
	    .attr("y", function(d) {return yScale(d.y);})
	    .attr("width", (barWidth - (barWidth * 0.1)))
	    .attr("height", function(d) {return  height - yScale(d.length);})
	    .attr("fill", function(d,i) { return "rgb(0, 0, " + (d.y * 3) + ")"});
	    
	    bars
	    .attr("height", 0)
	    .attr("y", height)
	    .transition().duration(1000)
	    .delay( function(d,i) { return i * 200; })
	    .attr({
	      "x": function(d) { return xScale(d.x); },
	      "y": function(d) { return yScale(d.y); },
	      "width": barWidth - (barWidth * 0.15),
	      "height": function(d) { return  height - yScale(d.length); }
	});
	    
	    bars
	    .on("mouseover", function() {
		console.log("Mouse Over" );
		d3.select(this)
			.attr("x", function(d) { return xScale(d.x);})
			.attr("fill", "orange")
			.attr("width", (barWidth - barWidth * 0.1))
			.attr("y", function(d) {return yScale(d.y * 1.1);})
			.attr("height", function(d) {return  (height - yScale(d.length * 1.1));});
	    	})
	    .on("mouseout", function(d) {
		console.log("Mouse Out" );
		d3.select(this)
			.transition()
			.duration(250)
		.attr("x", function(d) { return xScale(d.x);})
		.attr("fill", function(d,i) { return "rgb(0, 0, " + (d.y * 3) + ")"})
		.attr("width", (barWidth - barWidth * 0.15))
		.attr("y", function(d) {return yScale(d.y);})
		.attr("height", function(d) {return  height - yScale(d.length);});
		});

		
	    svg.selectAll('text')
	    	.data(dataSet)
	    	.enter()
	    	.append('text')
	    	.text(function(d) {
	    	    return d.formed;
	    	})
	    	.attr({
		"x" : function(d) {
		    return xScale(d.x) ;},
		"y" : function(d) {
		    return yScale(d.length) + 12;
		},

		"font-family" : 'sans-serif',
		"font-size" : '13px',
		"font-weight" : 'bold',
		"fill" : 'white',
		"text-anchor" : 'middle'
	    });

	    // Draw xAxis and position the label
	    svg.append("g").attr("class", "x axis").attr("transform",
		    "translate(0," + height + ")").call(xAxis).selectAll("text").attr(
		    "dx", "-.8em").attr("dy", ".25em").attr("transform", "rotate(-60)")
		    .style("text-anchor", "end").attr("font-size", "10px");

	    // Draw yAxis and postion the label
	    svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr(
		    "transform", "rotate(-90)").attr("x", -height / 2).attr("dy",
		    "-3em").style("text-anchor", "middle").text(
		    "No of Bands");
	});

    
}


function dragStart() {
	var coordinates = [0, 0];
	coordinates = d3.mouse(this);
	var x = coordinates[0];
	var y = coordinates[1];
	dragStartX = x;
}

function dragEnd() {
	var coordinates = [0, 0];
	coordinates = d3.mouse(this);
	var x = coordinates[0];
	var y = coordinates[1];
	dragEndX= x;
	var diff = dragEndX - dragStartX;
	if(diff < 0) {
	    	binCount = 7;
		showBar();
	} else if(diff > 0) {
	    	binCount = 10;
	    	showBar();
	}
}

function toggleForceLayout() {
    if(isForceShown == 0) {
	isForceShown = 1;
	showForceLayout();
    } else {
	isForceShown = 0;
	toggleBarPie();
    }
}

function showForceLayout() {
	
    	d3.select("h1").text("No of Fans vs Year Formed");
	d3.select("svg").remove();
	
	var width = 1000,
		height = 800;

	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);

	var force = d3.layout.force()
		.size([width, height]);

	d3.csv("metal_bands_2017.csv", function(error, links) {
	  if (error) throw error;

	  var nodesByName = {};

	  // Create nodes for each unique source and target.
	  links.forEach(function(link) {
		link.source = nodeByName(link.formed);
		link.target = nodeByName(link.fans);
	  });

	  // Extract the array of nodes from the map by name.
	  var nodes = d3.values(nodesByName);

	  // Create the link lines.
	  var link = svg.selectAll(".link")
		  .data(links)
		.enter().append("line")
		  .attr("class", "link");

	  // Create the node circles.
	  var node = svg.selectAll(".node")
		  .data(nodes)
		.enter().append("circle")
		  .attr("class", "node")
		  .attr("r", 4.5)
		  .call(force.drag);

	  // Start the force layout.
	  	force
		  .nodes(nodes)
		  .links(links)
		  .on("tick", tick)
		  .start();

	  function tick() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	  }

	  function nodeByName(name) {
		return nodesByName[name] || (nodesByName[name] = {name: name});
	  }
	});
}

function tweenPie(b) {
    b.innerRadius = 0;
    var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function(t) { return arc(i(t)); };
  }

function showPie() {
    
    
    d3.select("svg").remove();

    
    d3.csv("metal_bands_2017.csv", function(error, data) {
	
	var yearFormed = data.map(function(i) {
	     return parseInt(i.formed);
   	})

   	var fans = data.map(function(i) {
	     return parseInt(i.fans);
   	})


   	if(selected == 0) {
	
   	    dataSet = d3.layout.histogram().bins(binCount)(yearFormed)

   	} else {
	
   	    dataSet = d3.layout.histogram().bins(binCount)(fans)

   	}
	
	var dataLength = new Array();
	for(i = 0; i < dataSet.length; i++) {
            dataLength[i] = dataSet[i].length;
        }
	
	var color = d3.scale.category10();

	var canvas = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);
		
	var group = canvas.append("g")
		.attr("transform", "translate(300, 200)");
		
	var arc = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);
		
	var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) { return d; })
	;
	
	var arcs = group.selectAll(".arc")
	  .data(pie(dataLength))
	.enter().append("g")
	  .attr("class", "arc");
	  
	arcs.append("path")
	  .attr("d", arc)
	  .attr("fill", function(d){
	return color(d.data);
	});
//	.transition()
//	.ease(d3.easeLinear)
//	.duration(2000)
//	.attrTween("d", tweenPie);
	
	
	arcs.append("text")
	  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	  .attr("dy", ".35em")
	  .text(function(d) { return d.data; });


    });
    	    
    
	
	}

