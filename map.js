window.onload = function() {

  d3.queue()
    .defer(d3.json, 'buurten.topojson')
    .defer(d3.json, 'info.json')
    .await(makeAmsterdam);


  var margin = { top: 10, right: 10, bottom: 10, left: 10 }
  var h = 600 - margin.top - margin.bottom
  var w = 800 - margin.left - margin.right
  format = d3.format(',.1%')


  var color = d3.scaleOrdinal(d3.schemeCategory10);


  function makeAmsterdam(error, data, info) {
    if (error) throw error;

      console.log(data);

      function change(value) {

        var pie = d3.pie()
          .sort(null)
          .value(function(d) {return d[value.properties.Stadsdeel]})

        d3.csv('pie.csv', function(error, dataPie) {
          if (error) throw error;

          dataPie.forEach(function(d) {
            console.log(d)
            d[value.properties.Stadsdeel] = +d[value.properties.Stadsdeel]
            d.Deel = d.Deel

          })
          svgPie.selectAll('.arc')
            .remove()
          pieTitle.selectAll('text')
            .remove()

            arcs = svgPie.selectAll('.arc')
              .data(pie(dataPie))
              .enter()
              .append('g')
              .attr('class', 'arc')

            arcs.append('path')
              .attr('d', path)
              .attr('fill', function(d) {return colorPie(d.data.Deel)})
              .transition()
              .ease(d3.easeLinear)
              .duration(1000)
              .attrTween('d', pieTween)

            arcs.append('text')
              .transition()
              .ease(d3.easeLinear)
              .duration(1000)
              .attr("transform", function(d) {return "translate(" + label.centroid(d) + ')'; })
              .attr('dy', "0.35em")
              .text(function(d) {return format(d.data[value.properties.Stadsdeel])})

            pieTitle.append('text')
               .attr('id', 'pieTitle')
               .text(function(d) {return value.properties.Stadsdeel})
               .attr('x', 220)
               .attr('y', 50)

        })
        function pieTween(b) {
          b.innerRadius = 0;
          var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
          return function(t) {return path(i(t));}
        }
      }

    var stadsdelen = topojson.feature(data, data.objects.buurten).features;

    transDict = {}
    prijsDict = {}
    bewDict = {}
    verkochtDict = {}
    info.forEach(function(d) {return transDict[d.Stadsdeel] = d.Transprijs})
    info.forEach(function(d) {return prijsDict[d.Stadsdeel] = d.Prijsm2})
    info.forEach(function(d) {return bewDict[d.Stadsdeel] = d.Bewoners})
    info.forEach(function(d) {return verkochtDict[d.Stadsdeel] = +d.Verkocht})


    // svg for map
    var svg = d3.select('#map')
      .append('svg')
      .attr('height', h + margin.top + margin.bottom)
      .attr('width', w + margin.left + margin.right)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    var projection = d3.geoMercator()
                       .center([4.9, 52.35])
                       .translate([w/2, h/2])
                       .scale(115500)

    var path = d3.geoPath()
                 .projection(projection)


    svg.selectAll('.stadsdelen')
      .data(stadsdelen)
      .enter().append('path')
      .attr('class', 'stadsdelen')
      .attr('d', path)
      .style('fill', function(d, i) {return color(i) })
      .on('mouseover', mouseover)
      .on('mouseout', function(d) {
        d3.select(this)
          .attr('opacity', 100)
        d3.select('#tip').classed('hidden', true)
      })
      .on('mousemove', mousemove)


      function mouseover(d) {
        d3.select(this)
          .attr('opacity', 0.5)
          if(d.properties.Stadsdeel == "Westpoort") {
            document.getElementById('tip').innerHTML = "<strong>Stadsdeel: </strong><span class='tiptext'>"
            + d.properties.Stadsdeel + "<br>Cijfers zijn onderverdeeld in de <br> stadsdelen West en Nieuw-West</span>"
          var xPos = parseFloat(d3.event.pageX) - 100;
          var yPos = parseFloat(d3.event.pageY) - 80;
          d3.select('#tip')
            .style('left', xPos + 'px')
            .style('top', yPos + 'px')
          d3.select('#tip').classed('hidden', false)

          d3.selectAll('.arc')
            .remove()
          } else {
          document.getElementById('tip').innerHTML = "<strong>Stadsdeel: \
    </strong><span class='tiptext'>" + d.properties.Stadsdeel +  "</span><br>" + "<strong>Transactieprijs Q1 2018 (mediaan): </strong> \
    <span class='tiptext'>" + transDict[d.properties.Stadsdeel] + '</span><br> \
    ' + "<strong>Prijs m2 prijs Q1 2018 (mediaan): </strong><span class='tiptext'>" + prijsDict[d.properties.Stadsdeel] +
    '</span><br>' + "<strong>Aantal bewoners 1 januari 2018: </strong><span class='tiptext'>" + bewDict[d.properties.Stadsdeel] + "</span><br>" +
    "<strong>Aantal verkochte woningen Q1 2018*: </strong><span class='tiptext'>" + verkochtDict[d.properties.Stadsdeel] + "</span>"

      var xPos = parseFloat(d3.event.pageX) - 150;
      var yPos = parseFloat(d3.event.pageY) - 130;
      d3.select('#tip')
        .style('left', xPos + 'px')
        .style('top', yPos + 'px')
        d3.select('#tip').classed('hidden', false)
      change(d);
      }

    }

    function mousemove(d) {
      d3.select(this)
      if(d.properties.Stadsdeel == "Westpoort") {
        var xPos = parseFloat(d3.event.pageX) - 100;
        var yPos = parseFloat(d3.event.pageY) - 80;
        d3.select('#tip')
          .style('left', xPos + 'px')
          .style('top', yPos + 'px')
        d3.select('#tip').classed('hidden', false)
      } else {
      var xPos = parseFloat(d3.event.pageX) - 150;
      var yPos = parseFloat(d3.event.pageY) - 130;
      d3.select('#tip')
        .style('left', xPos + 'px')
        .style('top', yPos + 'px')
      d3.select('#tip').classed('hidden', false)
      }

    }

    height = 300
    width = 300
    radius = width / 2

    svgPie = d3.select('#pie').append('svg')
      .attr('height', height)
      .attr('width', width)
      .attr('radius', radius)
      .attr('id', 'svgPie')
      .append('g')
      .attr('transform', 'translate('+ width / 2 + ',' + height / 2 + ')')


    colorPie = d3.scaleOrdinal(['#98abc5', '#6b486b', '#a05d56'])


    var path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

    var label = d3.arc()
      .outerRadius(radius - 80)
      .innerRadius(radius - 60);


    var pie = d3.pie()
      .sort(null)
      .value(function(d) {return d.Amsterdam})

    var pieTitle = d3.select('#pie').append('svg').append('g')


    d3.csv("pie.csv", function(error, dataPie) {
      if (error) throw error;

      dataPie.forEach(function(d) {
      d.Amsterdam = +d.Amsterdam
      d.Deel = d.Deel

      })
      function makePie() {
      svgPie.selectAll('.arc')
        .remove()

      pieTitle.selectAll('text')
        .remove()

      var arc = svgPie.selectAll('.arc')
        .data(pie(dataPie))
        .enter().append('g')
        .attr('class', 'arc')

      arc.append('path')
         .attr('d', path)
         .attr('fill', function(d) {return colorPie(d.data.Deel)})
         .transition()
         .ease(d3.easeLinear)
         .duration(1000)
         .attrTween('d', pieTween)

      arc.append('text')
         .transition()
         .ease(d3.easeLinear)
         .duration(1000)
         .attr("transform", function(d) {return "translate(" + label.centroid(d) + ')'; })
         .attr('dy', "0.35em")
         .text(function(d) {return format(d.data.Amsterdam)})

      pieTitle.append('text')
         .attr('id', 'pieTitle')
         .text('Amsterdam')
         .attr('x', 220)
         .attr('y', 50)


      function pieTween(b) {
        b.innerRadius = 0;
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) {return path(i(t));}
      }
      }

      var pieDiv = d3.select('#pie').append('svg').attr('class', 'legendSvp')
      var legendP = pieDiv.selectAll('.legend')
        .data(dataPie)
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i) {
          return 'translate(0,' + (10 + i*20) + ')'})

      legendP.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', function(d, i) {
          return colorPie(i)
        })

      legendP.append('text')
        .attr("x", 20)
        .attr("y", 10)
        .text(function(d) {return d.Deel})
        .attr("class", "textselected")
        .style("text-anchor", "start")
        .style("font-size", 15)

        makePie()
        d3.selectAll('.stadsdelen')
          .on('mouseleave', makePie)
    })
  }
}
