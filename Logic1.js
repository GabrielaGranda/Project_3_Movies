// Utility function to format large numbers with "B" instead of "G"
const formatNumber = d3.format(".2~s");
const customFormat = value => formatNumber(value).replace("G", "B");

// Reusable function to capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fetching and updating scatter plots based on dropdown selection
document.getElementById('top30Select').addEventListener('change', updateScatterPlots);

function updateScatterPlots() {
    fetch('data_2.json')
        .then(response => response.json())
        .then(data => {
            const top30Select = document.getElementById('top30Select').value;

            // Update scatter plot titles
            document.getElementById('scatter-vote-title').innerText = `Correlation Between Vote Average and Box Office Revenue (${capitalizeFirstLetter(top30Select)})`;
            document.getElementById('scatter-revenue-title').innerText = `Correlation Between Budget and Box Office Revenue (${capitalizeFirstLetter(top30Select)})`;

            // Filter data based on the selected top 30 metric
            const top30Data = getTop30Data(data, top30Select);

            // Draw scatter plots based on selected data
            drawScatterPlot(top30Data, 'scatter-vote-revenue', 'vote_average', 'revenue', 'Vote Average', 'Revenue (Millions)');
            drawScatterPlot(top30Data, 'scatter-revenue-budget', 'budget', 'revenue', 'Budget (Millions)', 'Revenue (Millions)');
        });
}

updateScatterPlots(); // Initial load

// Function to sort and slice the data for top 30 analysis
function getTop30Data(data, metric) {
    let sortedData = data.sort((a, b) => b[metric] - a[metric]);
    return sortedData.slice(0, 30);
}

// Scatter plot function (used for correlation analysis)
function drawScatterPlot(data, elementId, xMetric, yMetric, xLabel, yLabel) {
    const svgWidth = 500;
    const svgHeight = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(`#${elementId}`).html("").append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[xMetric])])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yMetric])])
        .range([height, 0]);

    const tooltip = createTooltip();

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d[xMetric]))
        .attr('cy', d => yScale(d[yMetric]))
        .attr('r', 5)
        .attr('fill', '#2BC0A7') // Mint color
        .on('mouseover', (event, d) => {
            d3.select(event.target).attr('r', 7).attr('fill', '#1B9E8D');
            showTooltip(event, d, tooltip, xLabel, yLabel, xMetric, yMetric);
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', (event) => {
            d3.select(event.target).attr('r', 5).attr('fill', '#2BC0A7');
            hideTooltip(event);
        });

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(customFormat));

    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(customFormat));

    // X Axis label
    svg.append('text')
        .attr('transform', `translate(${width / 2},${height + margin.bottom - 20})`)
        .style('text-anchor', 'middle')
        .text(xLabel);

    // Y Axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .text(yLabel);
}

// Function to define and apply gradients
function defineGlobalGradient(svg, elementId, isVertical = false) {
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", `gradient-${elementId}`)
        .attr(isVertical ? "y1" : "x1", "0%")
        .attr(isVertical ? "y2" : "x2", "100%")
        .attr(isVertical ? "x1" : "y1", "0%")
        .attr(isVertical ? "x2" : "y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#5A67D8"); // Purple

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ED64A6"); // Pink
}

// Fetching and updating charts based on dropdown selection
document.getElementById('topBottomSelect').addEventListener('change', updateCharts);

function updateCharts() {
    fetch('data_2.json')
        .then(response => response.json())
        .then(data => {
            const topBottomSelect = document.getElementById('topBottomSelect').value;

            // Update titles dynamically
            document.getElementById('revenue-title').innerText = `${capitalizeFirstLetter(topBottomSelect)} 10 Movies by Box Office Revenue`;
            document.getElementById('popularity-title').innerText = `${capitalizeFirstLetter(topBottomSelect)} 10 Popular Movies`;
            document.getElementById('budget-title').innerText = `${capitalizeFirstLetter(topBottomSelect)} 10 Budgeted Movies`;
            document.getElementById('vote-title').innerText = `${capitalizeFirstLetter(topBottomSelect)} 10 Rated Movies of All Time`;

            // Get and update chart data
            const revenueData = getTopBottomData(data, topBottomSelect, 'revenue');
            drawVerticalBarChart(revenueData, 'revenue-bar', 'revenue', 'Revenue (Millions)');

            const popularityData = getTopBottomData(data, topBottomSelect, 'popularity');
            drawBarChart(popularityData, 'popularity-bar', 'popularity', 'Popularity Score');

            const budgetData = getTopBottomData(data, topBottomSelect, 'budget');
            drawBarChart(budgetData, 'budget-bar', 'budget', 'Budget (Millions)');

            const voteData = getTopBottomData(data, topBottomSelect, 'vote_average');
            drawVerticalBarChart(voteData, 'vote-bar', 'vote_average', 'Vote Average');
        });
}

updateCharts(); // Initial load

// Function to sort and slice the data for top/bottom 10 analysis
function getTopBottomData(data, type, metric) {
    let sortedData = data.sort((a, b) => b[metric] - a[metric]);
    return type === 'top' ? sortedData.slice(0, 10) : sortedData.slice(-10);
}

// Horizontal bar chart function (used for popularity and budget charts)
function drawBarChart(data, elementId, metric, label) {
    const svgWidth = 550;
    const svgHeight = 250;
    const margin = { top: 20, right: 20, bottom: 50, left: 120 }; // Adjusted left margin for long movie names
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(`#${elementId}`).html("").append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    defineGlobalGradient(svg, elementId); // Define gradient once globally

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[metric])])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.title))
        .range([0, height])
        .padding(0.1);

    const tooltip = createTooltip();

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', d => yScale(d.title))
        .attr('width', d => xScale(d[metric]))
        .attr('height', yScale.bandwidth())
        .attr('fill', `url(#gradient-${elementId})`)
        .attr('class', 'bar') // Add a class to target the hover effect with CSS
        .on('mouseover', (event, d) => {
            d3.select(event.target).classed('hovered', true); // Add the 'hovered' class
            showTooltip(event, d, tooltip, label, metric);
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', (event) => {
            d3.select(event.target).classed('hovered', false); // Remove the 'hovered' class
            hideTooltip(event);
        });

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(customFormat));

    svg.append('g')
        .call(d3.axisLeft(yScale));
}

// Vertical bar chart function (used for revenue and vote charts)
function drawVerticalBarChart(data, elementId, metric, label) {
    const svgWidth = 550;
    const svgHeight = 250;
    const margin = { top: 20, right: 20, bottom: 100, left: 80 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(`#${elementId}`).html("").append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Note: The gradient for vertical bars should transition top to bottom
    defineGlobalGradient(svg, elementId, true); // Pass true to make the gradient vertical

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.title))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[metric])])
        .range([height, 0]);

    const tooltip = createTooltip();

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.title))
        .attr('y', d => yScale(d[metric]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(d[metric]))
        .attr('fill', `url(#gradient-${elementId})`)
        .attr('class', 'bar') // Add a class to target the hover effect with CSS
        .on('mouseover', (event, d) => {
            d3.select(event.target).classed('hovered', true); // Add the 'hovered' class
            showTooltip(event, d, tooltip, label, metric);
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', (event) => {
            d3.select(event.target).classed('hovered', false); // Remove the 'hovered' class
            hideTooltip(event);
        });

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(customFormat));
}

// Utility function to create a tooltip
function createTooltip() {
    return d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', '#333')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '5px')
        .style('font-size', '14px')
        .style('pointer-events', 'none');
}

// Utility function to show the tooltip
function showTooltip(event, d, tooltip, label, metric) {
    tooltip.transition().duration(200).style('opacity', .9);
    tooltip.html(`${d.title}<br>${label}: ${customFormat(d[metric])}`)
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY - 28}px`);
}

// Utility function to move the tooltip
function moveTooltip(event) {
    d3.select('.tooltip')
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY - 28}px`);
}

// Utility function to hide the tooltip and reset the bar color
function hideTooltip(event) {
    d3.select('.tooltip')
        .transition()
        .duration(0)
        .style('opacity', 0)
        .style('left', '-9999px') // Move it off-screen
        .style('top', '-9999px');
}


