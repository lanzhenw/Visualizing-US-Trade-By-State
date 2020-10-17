var tradeVolumeDataset
var stateNames


function numConverter (d) {
  d.total_trade_activity = +d.total_trade_activity
  d.import_2018 = +d.import_2018
  d.export_2018 = +d.export_2018
  return d
}

d3.csv("./data/csv/allState2018.csv")
  .then(data => {
    const csvdata = numConverter(data)
    console.log(csvdata)
    tradeVolumeDataset = csvdata
    
    var legendData = ['Total Exports', 'Total Imports']
  
    // Setup chart 
    var margin = {top: 50, right: 10, bottom: 0, left: 105}
    var width = 432 - margin.right - margin.left
    var height = 577 - margin.top - margin.bottom
    var colors = ['#C85FE5', '#6B56D3']
  
    var svg = d3.select('#bar')
                  .append('svg')
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    let tooltip = d3.select('#bar')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0)
    // Axes
    var xScale = d3.scaleLinear()
                  .domain([0, 620.1])
                  .range([0, width])
  
    var yScale = d3.scaleBand()
                  .range([0, height])
                  .domain(tradeVolumeDataset.map(function(d) { return d.state}))
                  .padding(1)
                  
    svg.append('g')
        .attr('class', 'axisLabel')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .data(tradeVolumeDataset)
        .enter()
        .append('text')
        .text(function(d) { return d.state})
        .attr('fill', 'white')
        .attr('class', 'axisLabels')
    
    // Lines
    svg.selectAll('lines')
        .data(tradeVolumeDataset)
        .enter()
        .append('line')
        .attr('x1', function(d) { return xScale(d.total_trade_activity)})
        .attr('x2', xScale(0))
        .attr('y1', function(d) { return yScale(d.state)})
        .attr('y2', function(d) { return yScale(d.state)})
        .attr('stroke', 'white')
  
    // Circles
    svg.selectAll('import-circles')
        .data(tradeVolumeDataset)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return xScale((d.import_2018 + d.export_2018))})
        .attr('cy', function(d) { return yScale(d.state)})
        .attr('r', '4')
        .style('fill', colors[1])
        .attr('stroke', colors[1])
        .on('mouseover', function (d) {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0.9)
    
          format = d3.format(',')
    
          var tip = 'Total ' + d.state + ' Imports: $' + d.import_2018 + ' B'
    
          tooltip.html(tip)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px')
        })
        .on('mouseout', function (d) {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0)
        })
  
    svg.selectAll('export-circles')
        .data(tradeVolumeDataset)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return xScale((d.export_2018))})
        .attr('cy', function(d) { return yScale(d.state)})
        .attr('r', '4')
        .style('fill', function(d) {return colors[0]})
        .attr('stroke', function(d) {return colors[0]})
        .on('mouseover', function (d) {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0.9)
    
          format = d3.format(',')
    
          var tip = 'Total ' + d.state + ' Exports: $' + d.export_2018 + ' B'
    
          tooltip.html(tip)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY - 28) + 'px')
        })
        .on('mouseout', function (d) {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0)
        })
  
    var legend = svg.selectAll('.legend')
                    .data(legendData)
                    .enter()
                    .append('circle')
                    .attr('cx', width - 150)
                    .attr('cy', function(d, i) {return height - 50 + (i * 25)})
                    .attr('r', '10')
                    .style('fill', function(d, i) {return colors[i]})
                    .attr('class', 'legend')
      
   svg.selectAll('textLabels')
          .data(legendData)
          .enter()
          .append('text')
          .text(function(d) {return d})
          .attr('class', 'textLabels')
          .attr('x', width - 135)
          .attr('y', function(d, i) { return height - 45 + (i * 25)})
  })
  .catch(error => console.log('There was an error loading trade volume data: ', error) )



  


          
