class Info {
    constructor(){
       
        this.margin = {top: 5, right: 5, bottom: 5, left: 5};
        let Info_box = d3.select("#Info_Box").classed("info_view", true);
        this.svgBounds = Info_box.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = parseInt(this.svgWidth);
        this.svg = Info_box.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight/20)
            .attr('id', 'info_svg') 
            
        let text_area1 = this.svg.append('g').attr('id', 'text_area1')
        let text_area2 = this.svg.append('g').attr('id', 'text_area2')
        let text_area3 = this.svg.append('g').attr('id', 'text_area3')
        let text_area4 = this.svg.append('g').attr('id', 'text_area4')
        let text_area5 = this.svg.append('g').attr('id', 'text_area5')
        
        
        
        text_area1.append("a")
            .attr("xlink:href","https://github.com/seyoun209/dataviscourse-pr-coloncancer",'_blank')
            .append("rect")  
            .attr("x", this.margin.left)
            .attr("y", this.margin.top)
            .attr("height", this.svgHeight/30)
            .attr("width", this.svgWidth/6)
            .style("fill", "gray")
            .attr("rx", 10)
            .attr("ry", 10);

        
        text_area1.append("text")
            .attr("x", this.svgWidth/10)
            .attr("y", this.svgHeight/50)
            .style("fill", "black")
            .style("font-size", this.svgWidth/100+'px')
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text("Genetic&Multivariate");


         
        text_area2.append("a")
            .attr("xlink:href","https://github.com/seyoun209/dataviscourse-pr-coloncancer",'_blank')
            .append("rect")  
            .attr("x", this.margin.left+this.svgWidth/6)
            .attr("y", this.margin.top)
            .attr("height", this.svgHeight/30)
            .attr("width", this.svgWidth/6)
            .style("fill", "gray")
            .attr("rx", 10)
            .attr("ry", 10);

       
        text_area2.append("text")
            .attr("x", this.svgWidth/10+this.svgWidth/6)
            .attr("y", this.svgHeight/50)
            .style("fill", "black")
            .style("font-size", this.svgWidth/100+'px')
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text("Polyps");


        
        text_area3.append("a")
            .attr("xlink:href", "mailto:jkkauwe@gmail.com",'_blank')
            .append("rect")  
            .attr("x", this.margin.left+this.svgWidth/6*2)
            .attr("y", this.margin.top)
            .attr("height", this.svgHeight/30)
            .attr("width", this.svgWidth/6)
            .style("fill", "gray")
            .attr("rx", 10)
            .attr("ry", 10);

        
        text_area3.append("text")
            .attr("x", this.svgWidth/10+this.svgWidth/6*2)
            .attr("y", this.svgHeight/50)
            .style("fill", "black")
            .style("font-size", this.svgWidth/100+'px')
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text("YouTube Tutorial");

        
        text_area4.append("a")
            .append("rect")  
            .attr("x", this.margin.left+3*this.svgWidth/6)
            .attr("y", this.margin.top)
            .attr("height", this.svgHeight/30)
            .attr("width", this.svgWidth/6)
            .style("fill", "gray")
            .attr("rx", 10)
            .attr("ry", 10);

        
        text_area4.append("text")
            .attr("x", this.svgWidth/10+3*this.svgWidth/6)
            .attr("y", this.svgHeight/50)
            .style("fill", "black")
            .style("font-size", this.svgWidth/100+'px')
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text("Process Book");


            
        text_area5.append("a")
            .append("rect")  
            .attr("x", this.margin.left+4*this.svgWidth/6)
            .attr("y", this.margin.top)
            .attr("height", this.svgHeight/30)
            .attr("width", this.svgWidth/6)
            .style("fill", "gray")
            .attr("rx", 10)
            .attr("ry", 10);

       
        text_area5.append("text")
            .attr("x", this.svgWidth/10+4*this.svgWidth/6)
            .attr("y", this.svgHeight/50)
            .style("fill", "black")
            .style("font-size", this.svgWidth/100+'px')
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("pointer-events", "none")
            .text("Contact");
    };
}