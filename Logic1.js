d3.json("data_2.json").then(function(data) {
    // Creates a single tooltip for the entire page
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#333")
        .style("color", "#fff")
        .style("padding", "8px 12px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("transition", "opacity 0.3s ease");

    // Function to draw the bar chart 
    function drawBarChart(data, elementId, metric, label) {
        const svgWidth = 550;
        const svgHeight = 350;
        const margin = { top: 20, right: 20, bottom: 50, left: 120 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Use D3's built-in color schemes

        const svg = d3.select(`#${elementId}`).html("").append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[metric])])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.title))
            .range([0, height])
            .padding(0.1);

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', d => yScale(d.title))
            .attr('width', d => xScale(d[metric]))
            .attr('height', yScale.bandwidth())
            .attr('fill', (d, i) => colorScale(i))
            .on('mouseover', (event, d) => {
                // Format revenue and budget for the tooltip
                const budget = d.budget ? `Budget: ${formatMillions(d.budget)}<br>` : "";
                const revenue = d.revenue ? `Revenue: ${formatMillions(d.revenue)}<br>` : "";

                tooltip.style("visibility", "visible")
                    .style("opacity", 1)
                    .html(`${d.title}<br>${budget}${revenue}${label}: ${customFormat(d[metric])}`);
            })
            .on('mousemove', (event) => {
                tooltip.style("top", `${event.pageY + 15}px`)
                    .style("left", `${event.pageX + 15}px`);
            })
            .on('mouseout', () => {
                tooltip.style("visibility", "hidden").style("opacity", 0).html("");
            });

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(customFormat));

        svg.append('g')
            .call(d3.axisLeft(yScale));
    }

    // Function to update widget titles based on dropdown selection
    function updateTitles(type) {
        const prefix = type === "top" ? "Top 10" : "Bottom 10";
        d3.select("#revenue-title").text(`${prefix} Movies by Box Office Revenue`);
        d3.select("#popularity-title").text(`${prefix} Popular Movies`);
        d3.select("#budget-title").text(`${prefix} Budgeted Movies`);
        d3.select("#vote-title").text(`${prefix} Rated Movies of All Time`);
    }

    // Function to update scatter plots based on dropdown selection
    function updateScatterPlots(option) {
        let filteredData;
        if (option === "vote_average") {
            filteredData = data.sort((a, b) => b.vote_average - a.vote_average).slice(0, 30);
        } else if (option === "revenue") {
            filteredData = data.sort((a, b) => b.revenue - a.revenue).slice(0, 30);
        } else if (option === "budget") {
            filteredData = data.sort((a, b) => b.budget - a.budget).slice(0, 30);
        }

        d3.select("#scatter-vote-revenue").html("");
        d3.select("#scatter-revenue-budget").html("");

        // Create the first scatter plot (Vote Average vs. Revenue)
        const svg1 = d3.select("#scatter-vote-revenue").append("svg")
            .attr("width", 600)
            .attr("height", 400);

        const margin1 = { top: 20, right: 20, bottom: 50, left: 60 };
        const width1 = 600 - margin1.left - margin1.right;
        const height1 = 400 - margin1.top - margin1.bottom;

        const plotArea1 = svg1.append("g")
            .attr("transform", `translate(${margin1.left},${margin1.top})`);

        const x1 = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.vote_average)])
            .range([0, width1]);

        const y1 = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.revenue)])
            .range([height1, 0]);

        plotArea1.append("g")
            .attr("transform", `translate(0,${height1})`)
            .call(d3.axisBottom(x1).ticks(6));

        plotArea1.append("g")
            .call(d3.axisLeft(y1).ticks(6).tickFormat(customFormat));

        plotArea1.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x1(d.vote_average))
            .attr("cy", d => y1(d.revenue))
            .attr("r", 5)
            .style("fill", "#69b3a2")
            .on("mouseover", (event, d) => {
                const voteAverage = d.vote_average ? d.vote_average.toFixed(1) : "N/A";
                const budget = d.budget ? formatMillions(d.budget) : "N/A";
                const revenue = d.revenue ? formatMillions(d.revenue) : "N/A";

                tooltip.style("visibility", "visible")
                    .style("opacity", 1)
                    .html(`Title: ${d.title}<br>Budget: ${budget}<br>Revenue: ${revenue}<br>Vote Average: ${voteAverage}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY + 15}px`)
                    .style("left", `${event.pageX + 15}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden").style("opacity", 0).html("");
            });

        plotArea1.append("text")
            .attr("x", width1 / 2)
            .attr("y", height1 + margin1.bottom - 10)
            .style("text-anchor", "middle")
            .text("Vote Average");

        plotArea1.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin1.left + 20)
            .attr("x", -height1 / 2)
            .style("text-anchor", "middle")
            .text("Revenue (in Millions)");

        // Create the second scatter plot (Budget vs. Revenue)
        const svg2 = d3.select("#scatter-revenue-budget").append("svg")
            .attr("width", 600)
            .attr("height", 400);

        const margin2 = { top: 20, right: 20, bottom: 50, left: 60 };
        const width2 = 600 - margin2.left - margin2.right;
        const height2 = 400 - margin2.top - margin2.bottom;

        const plotArea2 = svg2.append("g")
            .attr("transform", `translate(${margin2.left},${margin2.top})`);

        const x2 = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.budget)])
            .range([0, width2]);

        const y2 = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.revenue)])
            .range([height2, 0]);

        plotArea2.append("g")
            .attr("transform", `translate(0,${height2})`)
            .call(d3.axisBottom(x2).ticks(6).tickFormat(customFormat));

        plotArea2.append("g")
            .call(d3.axisLeft(y2).ticks(6).tickFormat(customFormat));

        plotArea2.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x2(d.budget))
            .attr("cy", d => y2(d.revenue))
            .attr("r", 5)
            .style("fill", "#ff6361")
            .on("mouseover", (event, d) => {
                const voteAverage = d.vote_average ? d.vote_average.toFixed(1) : "N/A";
                const budget = d.budget ? formatMillions(d.budget) : "N/A";
                const revenue = d.revenue ? formatMillions(d.revenue) : "N/A";

                tooltip.style("visibility", "visible")
                    .style("opacity", 1)
                    .html(`Title: ${d.title}<br>Budget: ${budget}<br>Revenue: ${revenue}<br>Vote Average: ${voteAverage}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY + 15}px`)
                    .style("left", `${event.pageX + 15}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden").style("opacity", 0).html("");
            });

        plotArea2.append("text")
            .attr("x", width2 / 2)
            .attr("y", height2 + margin2.bottom - 10)
            .style("text-anchor", "middle")
            .text("Budget (in Millions)");

        plotArea2.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin2.left + 20)
            .attr("x", -height2 / 2)
            .style("text-anchor", "middle")
            .text("Revenue (in Millions)");
    }

    // Bubble Chart (Budget vs. Revenue)
    function drawBubbleChart(data) {
        console.log("Rendering Bubble Chart...");
        console.log(data); // Check the data being passed
    
        // Ensuring only valid data is passed
        const filteredData = data.filter(d => d.budget > 0 && d.revenue > 0 && d.vote_average > 0);
        
        const svgWidth = 600;
        const svgHeight = 400;
        const margin = { top: 20, right: 20, bottom: 50, left: 60 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;
        
        const svg = d3.select("#bubble-chart").html("").append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Check if there is valid data to plot
        if (filteredData.length === 0) {
            svg.append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .style("text-anchor", "middle")
                .text("No data available for this chart");
            return;
        }
        
        // Define the color scale based on efficiency (revenue/budget)
        const colorScale = d3.scaleLinear()
            .domain([0, 3, 7, 12, 20]) // Adjusted for better distribution
            .range(["red", "orange", "yellow", "lightgreen", "green"]); // Smooth transition from inefficient to efficient
    
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.budget)])
            .range([0, width]);
        
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.revenue)])
            .range([height, 0]);
        
        const bubbleSize = d3.scaleSqrt()
            .domain([0, d3.max(filteredData, d => d.vote_average)])
            .range([5, 20]);
        
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).ticks(6).tickFormat(customFormat));
        
        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(6).tickFormat(customFormat));
        
        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.budget))
            .attr("cy", d => yScale(d.revenue))
            .attr("r", d => bubbleSize(d.vote_average))
            .style("fill", d => colorScale(d.revenue / d.budget)) // Apply the color based on efficiency
            .style("opacity", 0.8)
            .on("mouseover", (event, d) => {
                const efficiency = (d.revenue / d.budget).toFixed(2);
                const voteAverage = d.vote_average ? d.vote_average.toFixed(1) : "N/A";
                const budget = d.budget ? formatMillions(d.budget) : "N/A";
                const revenue = d.revenue ? formatMillions(d.revenue) : "N/A";
    
                tooltip.style("visibility", "visible")
                    .style("opacity", 1)
                    .html(`Title: ${d.title}<br>Efficiency: ${efficiency}<br>Budget: ${budget}<br>Revenue: ${revenue}<br>Vote Average: ${voteAverage}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY + 15}px`)
                    .style("left", `${event.pageX + 15}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden").style("opacity", 0).html("");
            });
        
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .style("text-anchor", "middle")
            .text("Budget (in Millions)");
        
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .text("Revenue (in Millions)");
    }
    
    

    // Success Ratio Bar Plot (Revenue/Budget Ratio)
    function drawSuccessRatioBarChart(data) {
        const svgWidth = 600;
        const svgHeight = 400;
        const margin = { top: 20, right: 20, bottom: 100, left: 80 };
        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        const svg = d3.select("#success-ratio-bar").html("").append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.title))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.revenue / d.budget)])
            .range([height, 0]);

        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.title))
            .attr('y', d => yScale(d.revenue / d.budget))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.revenue / d.budget))
            .attr('fill', "#ff6361")
            .on('mouseover', (event, d) => {
                const ratio = (d.revenue / d.budget).toFixed(2);
                const revenue = formatMillions(d.revenue);
                const budget = formatMillions(d.budget);

                tooltip.style("visibility", "visible")
                    .style("opacity", 1)
                    .html(`Title: ${d.title}<br>Revenue/Budget Ratio: ${ratio}<br>Revenue: ${revenue}<br>Budget: ${budget}`);
            })
            .on('mousemove', (event) => {
                tooltip.style("top", `${event.pageY + 15}px`)
                    .style("left", `${event.pageX + 15}px`);
            })
            .on('mouseout', () => {
                tooltip.style("visibility", "hidden").style("opacity", 0).html("");
            });

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append('g')
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(customFormat));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 50)
            .style("text-anchor", "middle")
            .text("Movie Titles");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .text("Revenue/Budget Ratio");
    }

    // Draw all bar charts (Revenue, Popularity, Budget, Vote Average)
    function drawAllBarCharts(type) {
        drawBarChart(getTopBottomData(data, type, "revenue"), "revenue-bar", "revenue", "Revenue (in Millions)");
        drawBarChart(getTopBottomData(data, type, "popularity"), "popularity-bar", "popularity", "Popularity");
        drawBarChart(getTopBottomData(data, type, "budget"), "budget-bar", "budget", "Budget (in Millions)");
        drawBarChart(getTopBottomData(data, type, "vote_average"), "vote-bar", "vote_average", "Vote Average");
    }

    // Handle dropdown changes for top/bottom 10
    d3.select("#topBottomSelect").on("change", function () {
        const selectedType = d3.select(this).property("value");
        updateTitles(selectedType);
        drawAllBarCharts(selectedType);
    });

    // Event listener for scatter plot dropdown changes
    d3.select("#top30Select").on("change", function () {
        const selectedOption = d3.select(this).property("value");
        updateScatterPlots(selectedOption);
    });

    // Initial page load setup
    updateTitles("top"); // Default to "Top 10"
    drawAllBarCharts("top"); // Draw charts for the top 10 by default
    d3.select("#top30Select").dispatch("change"); // Force scatter plots to render initially
    drawBubbleChart(data); // Draw the bubble chart with all available data
    drawSuccessRatioBarChart(getTopBottomData(data, 'top', 'revenue')); // Default to top 10 by revenue
});

// Utility functions (for consistency)
function customFormat(value) {
    const format = d3.format(".2~s");
    return format(value).replace("G", "B"); // Adjust for billions
}

function formatMillions(value) {
    return `${(value / 1e6).toFixed(2)}M`;
}

function getTopBottomData(data, type, metric) {
    let sortedData = data.sort((a, b) => b[metric] - a[metric]);
    return type === 'top' ? sortedData.slice(0, 10) : sortedData.slice(-10);
}
