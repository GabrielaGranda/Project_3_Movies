function Gabinit() {
  fetch('data_2.json')
      .then(response => response.json())
      .then((data) => {
          // Extract years and revenues from the data
          const years = data.map(item => new Date(item.release_date).getFullYear());
          const revenues = data.map(item => item.revenue);
          const titles = data.map(item => item.title); // Example field for marker title

          // Sort data by year in ascending order
          const sortedData = data
              .map((item, index) => ({ year: years[index], revenue: revenues[index], title: titles[index], index }))
              .sort((a, b) => a.year - b.year);

          // Create frames for animation
          let frames = sortedData.map((item, index) => ({
              name: index.toString(),
              data: [{
                  x: sortedData.slice(0, index + 1).map(d => d.year),
                  y: sortedData.slice(0, index + 1).map(d => d.revenue),
                  mode: 'markers',
                  marker: {
                      size: 20,
                      color: sortedData.slice(0, index + 1).map(d => d.revenue),
                      colorscale: "Bluered"
                  },
                  text: sortedData.slice(0, index + 1).map(d => d.title), // Marker text
                  hoverinfo: 'text+y', // Show text and y value on hover
              }]
          }));

          // Define the layout
          let layout = {
              autosize: true,
              height: 700,
              title: "How is the revenue behavior over the years?",
              paper_bgcolor: 'rgba(255,255,255,0)',
              plot_bgcolor: 'rgba(255,255,255,0)',
              xaxis: {
                  title: 'Year',
                  showgrid: true,
                  zeroline: true,
                  gridcolor: '#bdbdbd',
                  gridwidth: 2,
                  zerolinecolor: '#969696',
                  zerolinewidth: 4,
              },
              yaxis: {title: 'Revenue'},
              updatemenus: [{
                  x: 0.5,
                  y: -0.1,
                  yanchor: "top",
                  xanchor: "center",
                  showactive: false,
                  direction: "left",
                  type: "buttons",
                  pad: {"t": 87, "r": 10},
                  buttons: [{
                      method: "animate",
                      Color: "blue",
                      args: [null, {
                          fromcurrent: true,
                          transition: {
                              duration: 500,
                              easing: 'linear'
                          },
                          frame: {
                              duration: 20,
                              redraw: true
                          }
                      }],
                      label: "Play"
                  }, {
                    method: "animate",
                      args: [
                      [null],
                      {
                          mode: "immediate",
                          frame: {
                              duration: 0,
                              redraw: false
                          },
                          transition: {
                              duration: 0
                              }
                          }
                      ],
                      label: "Pause"
                  }]
              }],
              sliders: [{
                  active: 0,
                  steps: sortedData.map((item, index) => ({
                      label: item.year.toString(),
                      method: 'animate',
                      args: [[index.toString()], {
                          mode: 'immediate',
                          frame: { duration: 100, redraw: true },
                          transition: { duration: 0 }
                      }]
                  })),
                  currentvalue: {
                      prefix: 'Year: ',
                      visible: true,
                      xanchor: 'right',
                      font: {
                          size: 20,
                          color: '#666'
                      }
                  }
              }]
          };

          // Initialize the plot
          Plotly.newPlot('bubble', [{
              x: [], // Start with no data
              y: [],
              mode: 'markers',
              marker: {
                  size: 15,
                  color: [],
                  colorscale: "Bluered"
              },
              text: [], // Text for hover information
              hoverinfo: 'text+y' // Show text and y value on hover
          }], layout);

          // Add frames to the plot
          Plotly.addFrames('bubble', frames);

           // Start animation automatically
           Plotly.animate('bubble', null, {
            transition: {
                duration: 500,
                easing: 'linear'
            },
            frame: {
                duration: 20,
                redraw: true
            }
        });

          // Add click event listener

      });
}

// Initialize the dashboard
//Gabinit();