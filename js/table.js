
class TableNonpolyp {
    constructor(headers, data) {
        this.name = "TableNonpolyp";

        // extract headers for table
        this.headerData = []
        for (const h of headers) {
            this.headerData.push({"sorted": false, "ascending": false, "key": h})
        }

        // extract data for table
        this.tableData = data;
        console.log(this.name + " init: " + this.tableData.length + " data.");

        // draw table
        this.updateHeaders();
        this.drawTable();
    }

    drawTable() {
        let rowSelection = d3.select('#nonpolypTableBody').selectAll('tr').data(this.tableData).join('tr');
        rowSelection.selectAll('td').data(d => Object.values(d)).enter().append('td').text(function(d, i){
            return d;
        }); 
    }
    updateHeaders() {
        let headerTds = d3.select('#nonpolypTableHead').selectAll('td').data(this.headerData).enter().append('td').text(d => d.key);
    }
}

class TablePolyp {
    constructor(headers, data) {
        this.name = "TablePolyp";

        // extract headers for table
        this.headerData = []
        for (const h of headers) {
            this.headerData.push({"sorted": false, "ascending": false, "key": h})
        }
        
        // extract data for table
        this.tableData = data;

        console.log(this.name + " init: " + this.tableData.length + " data.");

        // draw table
        this.updateHeaders();
        this.drawTable();
        this.drawColon();
    }

    drawTable() {
        let that = this;
        let rowSelection = d3.select('#polypTableBody').selectAll('tr').data(this.tableData).join('tr');
        rowSelection.selectAll('td').data(d => Object.values(d)).enter().append('td').text(function(d, i){
            return d;
        })
        .on("mouseover", function(d) {
            let selectedRow = this.parentNode.rowIndex - 1;
            let selectedData = that.tableData[selectedRow];
            that.polypMouseOver(selectedRow, selectedData);
        })
        .on("mouseout", function(d) {
            let unselectedRow = this.parentNode.rowIndex - 1;
            that.polypMouseOut(unselectedRow);
        });
    }

    polypMouseOver(selectedRow, selectedPolyp) {
        let polypSize = selectedPolyp["polypsize"]
        d3.select("#colon-interactive").append("circle").attr("cx", "100").attr("cy", "100").attr("r", "100").attr("id", "polyp-" + selectedRow);
        console.log("selected:" + selectedRow);
    }
    polypMouseOut(unselectedRow) {
        d3.select("#polyp-" + unselectedRow).remove();
        console.log("unselected:" + unselectedRow);
    }

    updateHeaders() {
        let headerTds = d3.select('#polypTableHead tr').selectAll("td").data(this.headerData).enter().append('td').text(d => d.key);
    }

    drawColon() {
        let w = 519;
        let h = 483;
        let imgContainer = d3.select('#colon-interactive') 
        imgContainer.append("svg:image")
            .attr("width", "100%").attr("height", "90%").attr("id", "colon-image")
            .attr("x", "0%").attr("y", "5%")
            .attr("xlink:href", "../assets/colon.png")

        // table to display polyp size info
        let polypSizes = ["<5mm", "5-9mm", "10-19mm", "20-29mm", "30-39mm", ">39mm"]
        let polypRadiuses = [5, 9, 19, 29, 39, 49]
        d3.select("#polyp-size-table tr:nth-child(2)").selectAll("td").data(polypSizes).enter().append("td").text(d=>d)
        let circleSvg = d3.select("#polyp-size-table tr:nth-child(1)").selectAll("td").data(polypRadiuses).enter().append("td").append("svg").attr("width", "100%").attr('height', d=>2.25*d);
        circleSvg.append("circle").attr("cx", "50%").attr("cy", "50%").attr("r", d=>d*0.75+"%").classed("polyp-size-circle", true)
    }
}



class QcDensityPlot {
    constructor(dataArray) {
        this.name = "QcDensityPlot";

        this.margin = { top: 20, right: 20, bottom: 60, left: 80 };
        this.width = 810 - this.margin.left - this.margin.right;
        this.height = 300 - this.margin.top - this.margin.bottom;

        this.dataArray = dataArray;
        // pre-compute min, ax values across all data
        this.mins = {x: Infinity , y: Infinity };
        this.maxs = {x: -Infinity , y: -Infinity };
        for (let d of this.dataArray) {
            this.mins.x = Math.min(this.mins.x, d.x);
            this.mins.y = Math.min(this.mins.y, d.y);
            this.maxs.x = Math.max(this.maxs.x, d.x);
            this.maxs.y = Math.max(this.maxs.y, d.y);
        }

        // extract headers to generate toggle buttons
        this.kinderIds = [];
        for (let d of this.dataArray) {
            if (this.kinderIds.indexOf(d.key) === -1) {
                this.kinderIds.push(d.key);
            }
        }
        this.kinderIds.sort();
        this.selectedKinderids = [];
        this.drawDensityPlot();
        this.initKinderidButtons();

    }

    drawDensityPlot() {
        d3.select('#qcdensity-plot')
            .append('svg').classed('plot-svg', true)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
            
        this.svgGroup = d3.select('#qcdensity-plot').select('.plot-svg').append('g').classed('wrapper-group', true);
        
        this.svgGroup.append('g').attr('id', 'x-axis');
        this.svgGroup.append('g').attr('id', 'y-axis');

        this.currentKinderid = this.svgGroup.append("text")
                                            .attr("x", this.margin.left/2 + this.width/2)
                                            .attr("y", this.margin.top)
                                            .text("").attr("text-anchor", "middle").attr("alignment-baseline", "top")

        // *** Setting the scales for your x, y, and circle data ***
        // x axis
        this.xScale = d3.scaleLinear().domain([this.mins.x, this.maxs.x]).range([0, this.width]).nice();
        let xAxis = d3.axisBottom().scale(this.xScale);
        let xAxisBar = this.svgGroup.select("#x-axis"); 
        xAxisBar.exit().remove(); 
        let xAxisEnter = this.svgGroup.enter().append('g');
        xAxisBar = xAxisBar.merge(xAxisEnter);
        xAxisBar.call(xAxis).classed("axis", true).attr("transform", "translate(" + this.margin.left + ", " + this.height + ")");
        xAxisBar.selectAll(".tick").classed("axis-label", true);

        // y axis
        this.yScale = d3.scaleLinear().domain([this.mins.y, this.maxs.y]).range([this.height-this.margin.top, 0]).nice();
        let yAxis = d3.axisLeft().scale(this.yScale);
        let yAxisBar = this.svgGroup.select("#y-axis");
        yAxisBar.exit().remove(); 
        let yAxisEnter = this.svgGroup.enter().append('g');
        yAxisBar = yAxisBar.merge(yAxisEnter);
        yAxisBar.call(yAxis).classed("axis", true).attr("transform", "translate(" + this.margin.left + ", " + this.margin.top + ")");
        yAxisBar.selectAll(".tick").classed("axis-label", true);

        // set axes labels
        this.svgGroup.append('text').attr('id', 'xText');
        this.svgGroup.append('text').attr('id', 'yText');
        
        let translateX = (0.5*this.width) + "," + (this.margin.top + this.height + 25);
        let xBarLabel = this.svgGroup.select("#xText");
        xBarLabel.exit().remove();

        let xEnter = xBarLabel.enter().append('text');
        xBarLabel = xBarLabel.merge(xEnter);

        xBarLabel.datum("score")
                .text(d => d.toUpperCase())
                .attr("transform", "translate(" + translateX + ")")
                .classed('x-label', true)
                    
        let yBarLabel = this.svgGroup.select("#yText");

        let yEnter = yBarLabel.enter().append('text');
        yBarLabel = yBarLabel.merge(yEnter);

        yBarLabel.datum("count")
                .text(d => d.toUpperCase())
                .attr("transform", "translate(40, "+ this.height/2 +") rotate(-90)")
                .classed('y-label', true)
                .style("text-anchor", "middle");
    }
    addDensityCircles(kid, data) {
        let that = this;
        
        let circlePlotEnter = this.svgGroup.append("g").classed(kid, true).selectAll('circle').data(data).enter().append('circle')
        .attr("cx", function (d) {
            return that.margin.left + that.xScale(d.x);
        })
        .attr("cy", this.height )
        .attr('r', 0).attr('class', d=>d.key).transition()
        .duration(300)
        .attr("cx", function (d) { return that.margin.left + that.xScale(d.x); } )
        .attr("cy", function (d) { return that.margin.top + that.yScale(d.y); } )
        .attr("r", 3);

        // circlePlot.transition().duration(300).attr('cy', this.height).remove();
    }
    removeDensityCircles(kid) {
        this.svgGroup.selectAll("." + kid).selectAll("circle").transition().duration(300).attr('cy', this.height).remove();
    }

    initKinderidButtons() {
        let that = this;
        let width = 1000;
        let height = 150;
        let margin = { top: 20, right: 20, bottom: 60, left: 80 };

        let buttonWidth = 75;
        let buttonHeight = 20;
        let buttonDiv = d3.select('#qcdensity-plot')
            .append('div').classed('kid-buttons-group', true)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            
        for (let kid of this.kinderIds) {
            buttonDiv.append("rect")
            .attr("class", "kid-button").attr("width", buttonWidth).attr("height", buttonHeight)
            .append("text").text(kid).attr("text-anchor", "middle").attr("alignment-baseline", "middle").attr("x", "100%").attr("y", "100%").attr("id", kid)
            .on("click", function(d) {
                let kinderid = d.path[0].id;
                if (d3.select(this.parentNode).classed(kinderid)) {
                    d3.select(this.parentNode).classed(kinderid, false);
                    const index = that.selectedKinderids.indexOf(kinderid);
                    if (index > -1) {
                        that.selectedKinderids.splice(index, 1);
                    }
                    that.removeDensityCircles(kinderid);
                } else{
                    d3.select(this.parentNode).classed(kinderid, true);
                    that.selectedKinderids.push(kid);

                    let data = [];
                    for (let d of that.dataArray) {
                        if (d.key == kid) {
                            data.push(d);
                        }
                    }
                    that.addDensityCircles(kid, data);
                }
                that.currentKinderid.text(that.selectedKinderids.join(" | "))
            })
        }
    }
}

