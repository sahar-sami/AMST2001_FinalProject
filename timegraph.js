function createChartSpaces(svg, margin) {
  const width = svg.attr('width');
  const height = svg.attr('height');
  let annotations = svg.append('g').attr('id', 'annotations');
  let chartArea = svg
    .append('g')
    .attr('id', 'points')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  return { width, height, annotations, chartArea };
}

const textInfos = {
  2: 'In 1883, the first Cornellian had a specific course added to their degree title: "In History and Political Science." It is the first instance of a \'major\' for the Bachelor of Philosophy.',
  4: "In 1874, Cornellians were recognized for earning Bachelors of Science in specific concentrations, chemistry and natural history. It is the first instance of a 'major' for both the Bachelor of Philosophy and Cornell overall.",
  6: "During this time, the degree was named as 'Doctor of Veterinary Medicine.' However, while doctor degrees are considered graduate degrees today, this was still considered as a 'first degree'.",
  9: "When this degree was re-introduced, it was renamed to 'Bachelor of Science in Agriculture,' still separated from the B.S. degree and not as a concentration.",
  10: "When this degree was re-introduced in the 1890s, it was renamed to 'Bachelor of the Science of Architecture.' It later went back to its original name of Bachelor of Architecture.",
  11: 'Although not included here, a new degree called Bachelor of Landscape Architecture (B.L.A.) was added to the College of Architecture at the time and was first conferred in 1923.',
  12: 'This degree was temporarily named Bachelor of Civil Engineering.',
  13: 'This degree was temporarily named Bachelor of Mechanical Engineering.',
  15: 'In 1902, this degree was renamed to Forest Engineer.',
  16: 'During these years, even though the Bachelor of Science was offered in the College of Agriculture and College of Home Economics, the College of Arts and Sciences instead offered just the Bachelor of Arts and Bachelor of Chemistry. This contrasts the College of Arts and Sciences today.',
  17: 'The B.F.A. was offered by the then-called College of Architecture, and today is offered by the College of Architecture, Art, and Planning.',
  18: 'Electrical Engineering used to be a concentration under the Mechanical Engineer degree. It later became its own conferrable degree, likely because many students were studying it.',
};

function timegraph() {
  d3.json('degreeRanges.json', d3.autoType).then((data) => {
    const degreeNames = Object.keys(data);
    console.log(data);
    const expanded = [];
    Object.entries(data).forEach(([degree, ranges]) => {
      console.log(ranges);
      ranges.forEach((range) => {
        expanded.push({
          degree,
          range,
        });
      });
    });
    const svg = d3
      .select('div#vis1-1')
      .append('svg')
      .attr('width', 800)
      .attr('height', 500)
      .attr('display', 'inline-block');
    const margin = { top: 10, right: 15, bottom: 60, left: 200 };
    const { width, height, annotations, chartArea } = createChartSpaces(
      svg,
      margin
    );
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const yearScale = d3
      .scaleLinear()
      .domain([1869, 1924])
      .range([0, chartWidth]);
    const degreeScale = d3
      .scaleBand()
      .domain(degreeNames)
      .range([chartHeight, 0]);

    let leftAxis = d3.axisLeft(degreeScale).ticks();
    let leftGridlines = d3
      .axisLeft(degreeScale)
      .tickSize(-chartWidth - 10)
      .tickFormat('');
    annotations
      .append('g')
      .attr('class', 'y axis')
      .attr('font', '16px times')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(leftAxis);
    annotations
      .append('g')
      .attr('class', 'y gridlines')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(leftGridlines);

    let bottomAxis = d3
      .axisBottom(yearScale)
      .ticks(14)
      .tickFormat(d3.format('d'));
    let bottomGridlines = d3
      .axisBottom(yearScale)
      .tickSize(-chartHeight - 10)
      .tickFormat('');
    annotations
      .append('g')
      .attr('class', 'x axis')
      .attr(
        'transform',
        `translate(${margin.left},${chartHeight + margin.top + 10})`
      )
      .call(bottomAxis);
    annotations
      .append('g')
      .attr('class', 'x gridlines')
      .attr(
        'transform',
        `translate(${margin.left},${chartHeight + margin.top + 10})`
      )
      .call(bottomGridlines);
    annotations
      .append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('x', margin.left + chartWidth / 2)
      .attr('y', chartHeight + margin.top + 40)
      .text('Year');

    let rectangles = chartArea
      .selectAll('rect')
      .data(expanded)
      .join('rect')
      .attr('x', (d) => yearScale(d['range'][0]))
      .attr('width', (d) => yearScale(d['range'][1]) - yearScale(d['range'][0]))
      .attr('y', (d) => degreeScale(d['degree']) + 10)
      .attr('height', 10)
      .attr('id', (d) => expanded.indexOf(d))
      .style('fill', '#B31B1B');

    const defaultText =
      'Some of the bars in the graph have special facts about that degree. Hover to learn more!';
    const timeRangeText = 'Time Range: ';

    d3.select('p#time-range').text(timeRangeText);
    d3.select('p#infos').text(defaultText);

    rectangles.on('mouseover', function () {
      const id = Number(d3.select(this).attr('id'));
      d3.select('p#time-range').text(
        `${timeRangeText}${expanded[id].range[0]} - ${expanded[id].range[1]}`
      );
      if (id in textInfos) {
        d3.select('p#infos').text(textInfos[id]);
      }
    });

    rectangles.on('mouseout', function () {
      d3.select('p#time-range').text(timeRangeText);
      d3.select('p#infos').text(defaultText);
    });
  });
}

function countgraph() {
  d3.csv('degrees_conferred.csv', d3.autoType).then((data) => {
    const num_degrees_conferred = [];
    data.forEach((d) => {
      const year = d['Year'];
      Object.entries(d).forEach(([label, value]) => {
        if (label !== 'Year' && value !== null)
          num_degrees_conferred.push({
            year: year,
            degree: label,
            number: value,
          });
      });
    });
    console.log(num_degrees_conferred);
    const svg = d3
      .select('div#visualization-2')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 500);
    const margin = { top: 10, right: 15, bottom: 60, left: 60 };
    const { width, height, annotations, chartArea } = createChartSpaces(
      svg,
      margin
    );

    const legendWidth = 300;
    const chartWidth = width - margin.left - margin.right - legendWidth;
    const chartHeight = height - margin.top - margin.bottom;

    let legend = svg.append('g').attr('id', 'legend');

    // Define Scales

    const yearScale = d3
      .scaleLinear()
      .domain(d3.extent(num_degrees_conferred, (d) => d.year))
      .range([0, chartWidth]);

    const totalScale = d3
      .scaleLinear()
      .domain([0, d3.max(num_degrees_conferred, (d) => d.number)])
      .range([chartHeight, 0]);

    const degreeGrouping = Array.from(
      d3.group(num_degrees_conferred, (d) => d.degree)
    ).map((entry) => {
      return {
        degree: entry[0],
        values: entry[1],
      };
    });

    const degreeNames = degreeGrouping.map((d) => d.degree);
    const degreeScale = d3.scaleOrdinal([
      '#2f4f4f',
      '#a0522d',
      '#006400',
      '#4b0082',
      '#ff0000',
      '#ffa500',
      '#f7cc0a',
      '#22ba22',
      '#00fa9a',
      '#00ffff',
      '#0000ff',
      '#ff00ff',
      '#eee8aa',
      '#6495ed',
      '#ff1493',
    ]);

    // Define Axes

    let leftAxis = d3.axisLeft(totalScale).ticks();
    let leftGridlines = d3
      .axisLeft(totalScale)
      .tickSize(-chartWidth - 10)
      .tickFormat('');
    annotations
      .append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(leftAxis);
    annotations
      .append('g')
      .attr('class', 'y gridlines')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(leftGridlines);
    annotations
      .append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('x', -chartHeight / 4)
      .attr('y', 20)
      .attr('transform', 'rotate(-90)')
      .text('Number of Degrees Conferred');

    let bottomAxis = d3
      .axisBottom(yearScale)
      .ticks()
      .tickFormat(d3.format('d'));
    let bottomGridlines = d3
      .axisBottom(yearScale)
      .tickSize(-chartHeight - 10)
      .tickFormat('');
    annotations
      .append('g')
      .attr('class', 'x axis')
      .attr(
        'transform',
        `translate(${margin.left},${chartHeight + margin.top + 10})`
      )
      .call(bottomAxis);
    annotations
      .append('g')
      .attr('class', 'x gridlines')
      .attr(
        'transform',
        `translate(${margin.left},${chartHeight + margin.top + 10})`
      )
      .call(bottomGridlines);
    annotations
      .append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('x', margin.left + chartWidth / 2)
      .attr('y', chartHeight + margin.top + 40)
      .text('Year');

    var lineGen = d3
      .line()
      .x((d) => yearScale(d['year']))
      .y((d) => totalScale(d['number']));

    let gTags = chartArea
      .selectAll('g.line')
      .data(degreeGrouping)
      .join('g')
      .attr('class', 'line')
      .style('stroke', (d) => degreeScale(d['degree']));

    gTags
      .append('path')
      .attr('d', (d) => lineGen(d.values))
      .style('stroke-width', 2)
      .style('fill', 'none');

    // Add one dot in the legend for each name.
    legend
      .selectAll('mydots')
      .data(degreeNames)
      .enter()
      .append('circle')
      .attr('cx', chartWidth + margin.left + margin.right)
      .attr('cy', (d, i) => 20 + i * 20)
      .attr('r', 5)
      .style('fill', (d) => degreeScale(d));

    // Add one dot in the legend for each name.
    legend
      .selectAll('mylabels')
      .data(degreeNames)
      .enter()
      .append('text')
      .attr('x', chartWidth + margin.left + margin.right + 25)
      .attr('y', (d, i) => 20 + i * 20)
      .style('fill', 'black')
      .text((d) => d)
      .style('font-size', 14)
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle');
  });
}
