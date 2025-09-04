import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, RadialLinearScale } from 'chart.js';
import { Bar, Doughnut, Line, Pie, PolarArea } from 'react-chartjs-2';
import * as d3 from 'd3';
import './Analytics.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [dateRange, setDateRange] = useState('30days');
  const [activeMetric, setActiveMetric] = useState('overview');
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const d3ChartRef = useRef();
  const heatmapRef = useRef();
  const treemapRef = useRef();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  useEffect(() => {
    if (analytics.revenueData) {
      createD3Charts();
    }
  }, [analytics]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Mock comprehensive analytics data
      const mockAnalytics = {
        overview: {
          totalRevenue: 2847392,
          totalProperties: 2847,
          totalUsers: 15432,
          totalViews: 847392,
          conversionRate: 8.3,
          avgPropertyValue: 425000,
          platformGrowth: 23.5,
          customerSatisfaction: 4.7
        },
        revenueData: [
          { month: 'Jan', revenue: 180000, properties: 45, commissions: 15000 },
          { month: 'Feb', revenue: 220000, properties: 58, commissions: 18500 },
          { month: 'Mar', revenue: 195000, properties: 52, commissions: 16800 },
          { month: 'Apr', revenue: 275000, properties: 67, commissions: 22000 },
          { month: 'May', revenue: 320000, properties: 78, commissions: 26500 },
          { month: 'Jun', revenue: 380000, properties: 89, commissions: 31200 }
        ],
        propertyAnalytics: {
          byType: {
            labels: ['Apartments', 'Houses', 'Condos', 'Villas', 'Commercial'],
            datasets: [{
              data: [1245, 892, 567, 234, 189],
              backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6'],
              borderWidth: 0
            }]
          },
          byPriceRange: {
            labels: ['<$200K', '$200K-$400K', '$400K-$600K', '$600K-$800K', '$800K+'],
            datasets: [{
              label: 'Properties',
              data: [456, 789, 678, 432, 289],
              backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
              borderColor: ['#ff5252', '#26a69a', '#2196f3', '#4caf50', '#ff9800'],
              borderWidth: 2
            }]
          },
          byLocation: {
            labels: ['Downtown', 'Suburbs', 'Waterfront', 'Historic District', 'Commercial Zone'],
            datasets: [{
              data: [678, 1234, 456, 289, 190],
              backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
            }]
          }
        },
        userAnalytics: {
          demographics: {
            labels: ['25-34', '35-44', '45-54', '55-64', '65+'],
            datasets: [{
              label: 'Users',
              data: [4567, 3892, 2876, 1945, 1152],
              backgroundColor: 'rgba(52, 152, 219, 0.8)',
              borderColor: '#3498db',
              borderWidth: 2
            }]
          },
          engagement: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Active Users',
              data: [8920, 9850, 10200, 11400, 12800, 13950],
              borderColor: '#2ecc71',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              tension: 0.4,
              fill: true
            }, {
              label: 'New Users',
              data: [1200, 1450, 1680, 1890, 2100, 2350],
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          retention: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
              data: [100, 78, 65, 58],
              backgroundColor: ['#2ecc71', '#f39c12', '#e67e22', '#e74c3c'],
              borderWidth: 0
            }]
          }
        },
        marketTrends: {
          priceIndex: {
            labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
            datasets: [{
              label: 'Market Price Index',
              data: [185, 192, 198, 205, 212, 218],
              borderColor: '#9b59b6',
              backgroundColor: 'rgba(155, 89, 182, 0.1)',
              tension: 0.4,
              fill: true
            }, {
              label: 'Platform Average',
              data: [190, 195, 201, 208, 215, 223],
              borderColor: '#1abc9c',
              backgroundColor: 'rgba(26, 188, 156, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          inventory: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Available Properties',
              data: [2450, 2380, 2520, 2680, 2750, 2890],
              backgroundColor: 'rgba(52, 152, 219, 0.8)',
              borderColor: '#3498db',
              borderWidth: 2
            }, {
              label: 'Sold Properties',
              data: [180, 220, 195, 275, 320, 380],
              backgroundColor: 'rgba(46, 204, 113, 0.8)',
              borderColor: '#2ecc71',
              borderWidth: 2
            }]
          }
        },
        performanceMetrics: {
          responseTime: [120, 115, 108, 125, 118, 110],
          uptime: [99.8, 99.9, 99.7, 99.8, 99.9, 99.9],
          errorRate: [0.2, 0.1, 0.3, 0.2, 0.1, 0.1],
          pageViews: [45000, 48000, 52000, 49000, 56000, 61000]
        },
        regionalData: [
          { region: 'North', sales: 450, revenue: 180000, growth: 15.2 },
          { region: 'South', sales: 380, revenue: 152000, growth: 12.8 },
          { region: 'East', sales: 520, revenue: 208000, growth: 18.5 },
          { region: 'West', sales: 420, revenue: 168000, growth: 14.3 },
          { region: 'Central', sales: 350, revenue: 140000, growth: 10.7 }
        ],
        heatmapData: generateHeatmapData(),
        treemapData: {
          name: "Properties",
          children: [
            { 
              name: "Apartments", 
              value: 1245, 
              color: "#3498db",
              avgPrice: 285000,
              locations: ["Downtown", "Suburbs", "Midtown"],
              growth: 15.2
            },
            { 
              name: "Houses", 
              value: 892, 
              color: "#2ecc71",
              avgPrice: 485000,
              locations: ["Suburbs", "Historic District", "Waterfront"],
              growth: 8.7
            },
            { 
              name: "Condos", 
              value: 567, 
              color: "#f39c12",
              avgPrice: 325000,
              locations: ["Downtown", "Waterfront", "Commercial Zone"],
              growth: 12.1
            },
            { 
              name: "Villas", 
              value: 234, 
              color: "#e74c3c",
              avgPrice: 1250000,
              locations: ["Waterfront", "Hill District", "Exclusive Areas"],
              growth: 22.8
            },
            { 
              name: "Commercial", 
              value: 189, 
              color: "#9b59b6",
              avgPrice: 750000,
              locations: ["Business District", "Industrial Zone", "Mixed Use"],
              growth: 6.4
            },
            {
              name: "Land",
              value: 156,
              color: "#34495e",
              avgPrice: 125000,
              locations: ["Outskirts", "Development Zones", "Rural"],
              growth: 18.3
            }
          ]
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  function generateHeatmapData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const data = [];
    
    days.forEach((day, dayIndex) => {
      hours.forEach(hour => {
        // Create realistic activity patterns
        let baseActivity = 10;
        
        // Higher activity during business hours (9-18)
        if (hour >= 9 && hour <= 18) {
          baseActivity = 60;
        }
        // Peak activity during lunch (12-14) and evening (18-21)
        if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21)) {
          baseActivity = 85;
        }
        // Lower activity late night/early morning (22-7)
        if (hour >= 22 || hour <= 7) {
          baseActivity = 15;
        }
        
        // Weekend patterns (reduce weekday activity by 30%)
        if (dayIndex >= 5) {
          baseActivity = Math.floor(baseActivity * 0.7);
        }
        
        // Add some randomness but keep patterns realistic
        const variance = Math.floor(Math.random() * 20) - 10;
        const finalValue = Math.max(5, baseActivity + variance);
        
        data.push({
          day: dayIndex,
          hour: hour,
          value: finalValue,
          dayName: day,
          category: getActivityCategory(hour, dayIndex)
        });
      });
    });
    
    return data;
  }
  
  function getActivityCategory(hour, dayIndex) {
    if (hour >= 9 && hour <= 17 && dayIndex < 5) return 'Business Hours';
    if (hour >= 18 && hour <= 22) return 'Evening Peak';
    if (hour >= 6 && hour <= 9) return 'Morning Rush';
    if (dayIndex >= 5) return 'Weekend Activity';
    return 'Low Activity';
  }

  const createD3Charts = () => {
    createRevenueChart();
    createHeatmap();
    createTreemap();
  };

  const createRevenueChart = () => {
    if (!d3ChartRef.current) return;
    
    d3.select(d3ChartRef.current).selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const svg = d3.select(d3ChartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleBand()
      .domain(analytics.revenueData.map(d => d.month))
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(analytics.revenueData, d => d.revenue)])
      .range([height, 0]);
    
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(analytics.revenueData, d => d.revenue)]);
    
    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'revenueGradient')
      .attr('x1', '0%').attr('x2', '0%')
      .attr('y1', '100%').attr('y2', '0%');
    
    gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:#667eea;stop-opacity:0.8');
    gradient.append('stop').attr('offset', '100%').attr('style', 'stop-color:#764ba2;stop-opacity:1');
    
    // Bars
    g.selectAll('.bar')
      .data(analytics.revenueData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.month))
      .attr('width', xScale.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', 'url(#revenueGradient)')
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 0.8);
        
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px');
        
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <strong>${d.month}</strong><br/>
          Revenue: $${d.revenue.toLocaleString()}<br/>
          Properties: ${d.properties}<br/>
          Commissions: $${d.commissions.toLocaleString()}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 1);
        d3.selectAll('.tooltip').remove();
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => yScale(d.revenue))
      .attr('height', d => height - yScale(d.revenue));
    
    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => '$' + (d/1000) + 'K'));
    
    // Labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Revenue ($)');
  };

  const createHeatmap = () => {
    if (!heatmapRef.current || !analytics.heatmapData) {
      console.log('Heatmap ref or data missing:', { ref: !!heatmapRef.current, data: !!analytics.heatmapData });
      return;
    }
    
    console.log('Creating heatmap with data:', analytics.heatmapData.slice(0, 5));
    
    d3.select(heatmapRef.current).selectAll('*').remove();
    
    const margin = { top: 60, right: 40, bottom: 40, left: 80 };
    const cellSize = 25;
    const width = 24 * cellSize + margin.left + margin.right;
    const height = 7 * cellSize + margin.top + margin.bottom;
    
    const svg = d3.select(heatmapRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#fafafa')
      .style('border', '1px solid #ddd')
      .style('border-radius', '8px');
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create a more vibrant color scale
    const minValue = d3.min(analytics.heatmapData, d => d.value);
    const maxValue = d3.max(analytics.heatmapData, d => d.value);
    
    console.log('Value range:', { min: minValue, max: maxValue });
    
    const colorScale = d3.scaleLinear()
      .domain([minValue, (minValue + maxValue) / 2, maxValue])
      .range(['#e8f4f8', '#4a90e2', '#1a5490']);
    
    // Create cells with better visibility
    g.selectAll('.cell')
      .data(analytics.heatmapData)
      .enter().append('rect')
      .attr('class', 'cell')
      .attr('x', d => d.hour * cellSize)
      .attr('y', d => d.day * cellSize)
      .attr('width', cellSize - 2)
      .attr('height', cellSize - 2)
      .attr('rx', 3)
      .style('fill', d => {
        const color = colorScale(d.value);
        console.log(`Hour: ${d.hour}, Day: ${d.day}, Value: ${d.value}, Color: ${color}`);
        return color;
      })
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).style('stroke', '#000').style('stroke-width', 2);
        
        const tooltip = d3.select('body').append('div')
          .attr('class', 'heatmap-tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.9)')
          .style('color', 'white')
          .style('padding', '12px')
          .style('border-radius', '8px')
          .style('font-size', '13px')
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
          .style('z-index', '9999');
        
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <strong>${d.dayName} ${d.hour}:00</strong><br/>
          Activity Level: <strong>${d.value}</strong><br/>
          <small style="color: #ccc;">${d.category}</small>
        `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 15) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).style('stroke', '#fff').style('stroke-width', 1);
        d3.selectAll('.heatmap-tooltip').remove();
      });
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('User Activity Heatmap (24h × 7 days)');
    
    // Add hour labels (0-23)
    g.selectAll('.hour-label')
      .data(d3.range(24))
      .enter().append('text')
      .attr('class', 'hour-label')
      .attr('x', d => d * cellSize + cellSize / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', '#666')
      .style('font-weight', '500')
      .text(d => {
        if (d === 0) return '12AM';
        if (d === 12) return '12PM';
        if (d < 12) return d + 'AM';
        return (d - 12) + 'PM';
      });
    
    // Add day labels
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    g.selectAll('.day-label')
      .data(days)
      .enter().append('text')
      .attr('class', 'day-label')
      .attr('x', -15)
      .attr('y', (d, i) => i * cellSize + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .style('font-weight', '500')
      .text(d => d);
    
    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 20;
    const legendY = height - 35;
    
    const legendScale = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, legendWidth]);
    
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.0f'));
    
    const legend = svg.append('g')
      .attr('transform', `translate(${legendX}, ${legendY})`);
    
    // Create gradient for legend
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%').attr('x2', '100%')
      .attr('y1', '0%').attr('y2', '0%');
    
    gradient.selectAll('stop')
      .data([
        { offset: '0%', color: '#e8f4f8' },
        { offset: '50%', color: '#4a90e2' },
        { offset: '100%', color: '#1a5490' }
      ])
      .enter().append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);
    
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)')
      .style('stroke', '#ccc')
      .style('stroke-width', 1);
    
    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#666');
    
    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text('Activity Level');
  };

  const createTreemap = () => {
    if (!treemapRef.current || !analytics.treemapData) return;
    
    d3.select(treemapRef.current).selectAll('*').remove();
    
    const width = 500;
    const height = 300;
    
    const svg = d3.select(treemapRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    const root = d3.hierarchy(analytics.treemapData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
    
    const treemap = d3.treemap()
      .size([width, height])
      .padding(2);
    
    treemap(root);
    
    const leaf = svg.selectAll('g')
      .data(root.leaves())
      .enter().append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);
    
    leaf.append('rect')
      .attr('id', d => d.id)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 1).style('stroke', '#000').style('stroke-width', 2);
        
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0)
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.9)')
          .style('color', 'white')
          .style('padding', '12px')
          .style('border-radius', '8px')
          .style('font-size', '12px')
          .style('box-shadow', '0 4px 8px rgba(0,0,0,0.3)')
          .style('z-index', '9999');
        
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <strong>${d.data.name}</strong><br/>
          Properties: <strong>${d.data.value.toLocaleString()}</strong><br/>
          Avg Price: <strong>$${d.data.avgPrice.toLocaleString()}</strong><br/>
          Growth: <strong>+${d.data.growth}%</strong><br/>
          <small>Primary locations: ${d.data.locations.slice(0,2).join(', ')}</small>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 0.8).style('stroke', 'none');
        d3.selectAll('.tooltip').remove();
      });
    
    leaf.append('text')
      .attr('x', 4)
      .attr('y', 14)
      .text(d => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-weight', 'bold');
    
    leaf.append('text')
      .attr('x', 4)
      .attr('y', 28)
      .text(d => d.data.value)
      .attr('font-size', '10px')
      .attr('fill', 'white');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#667eea',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          color: '#666'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          color: '#666'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Controls */}
      <div className="analytics-controls">
        <div className="date-range-selector">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        
        <div className="metric-tabs">
          <button 
            className={activeMetric === 'overview' ? 'active' : ''}
            onClick={() => setActiveMetric('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={activeMetric === 'revenue' ? 'active' : ''}
            onClick={() => setActiveMetric('revenue')}
          >
            💰 Revenue
          </button>
          <button 
            className={activeMetric === 'properties' ? 'active' : ''}
            onClick={() => setActiveMetric('properties')}
          >
            🏠 Properties
          </button>
          <button 
            className={activeMetric === 'users' ? 'active' : ''}
            onClick={() => setActiveMetric('users')}
          >
            👥 Users
          </button>
          <button 
            className={activeMetric === 'market' ? 'active' : ''}
            onClick={() => setActiveMetric('market')}
          >
            📈 Market
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      {activeMetric === 'overview' && (
        <div className="overview-section">
          <div className="kpi-grid">
            <div className="kpi-card revenue">
              <div className="kpi-icon">💰</div>
              <div className="kpi-info">
                <h3>{formatCurrency(analytics.overview?.totalRevenue)}</h3>
                <p>Total Revenue</p>
                <span className="trend positive">+{analytics.overview?.platformGrowth}%</span>
              </div>
            </div>
            
            <div className="kpi-card properties">
              <div className="kpi-icon">🏠</div>
              <div className="kpi-info">
                <h3>{formatNumber(analytics.overview?.totalProperties)}</h3>
                <p>Total Properties</p>
                <span className="trend positive">+12%</span>
              </div>
            </div>
            
            <div className="kpi-card users">
              <div className="kpi-icon">👥</div>
              <div className="kpi-info">
                <h3>{formatNumber(analytics.overview?.totalUsers)}</h3>
                <p>Total Users</p>
                <span className="trend positive">+8%</span>
              </div>
            </div>
            
            <div className="kpi-card views">
              <div className="kpi-icon">👁️</div>
              <div className="kpi-info">
                <h3>{formatNumber(analytics.overview?.totalViews)}</h3>
                <p>Total Views</p>
                <span className="trend positive">+15%</span>
              </div>
            </div>
            
            <div className="kpi-card conversion">
              <div className="kpi-icon">📈</div>
              <div className="kpi-info">
                <h3>{analytics.overview?.conversionRate}%</h3>
                <p>Conversion Rate</p>
                <span className="trend positive">+0.8%</span>
              </div>
            </div>
            
            <div className="kpi-card satisfaction">
              <div className="kpi-icon">⭐</div>
              <div className="kpi-info">
                <h3>{analytics.overview?.customerSatisfaction}/5</h3>
                <p>Customer Rating</p>
                <span className="trend positive">+0.2</span>
              </div>
            </div>
          </div>

          <div className="overview-charts">
            <div className="chart-container full-width">
              <h3>Revenue Trend (D3.js Interactive)</h3>
              <div className="d3-chart" ref={d3ChartRef}></div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Analytics */}
      {activeMetric === 'revenue' && (
        <div className="revenue-section">
          <div className="section-header">
            <h2>Revenue Analytics</h2>
            <div className="revenue-summary">
              <span>Total: {formatCurrency(analytics.overview?.totalRevenue)}</span>
              <span>Average: {formatCurrency(analytics.overview?.avgPropertyValue)}</span>
            </div>
          </div>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Regional Performance</h3>
              <div className="regional-chart">
                {analytics.regionalData?.map(region => (
                  <div key={region.region} className="regional-item">
                    <div className="region-info">
                      <h4>{region.region}</h4>
                      <p>Sales: {region.sales}</p>
                      <p>Revenue: {formatCurrency(region.revenue)}</p>
                    </div>
                    <div className="region-growth">
                      <span className="growth-rate">+{region.growth}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chart-container">
              <h3>Activity Heatmap (D3.js)</h3>
              <div className="d3-chart" ref={heatmapRef}></div>
            </div>
          </div>
        </div>
      )}

      {/* Property Analytics */}
      {activeMetric === 'properties' && (
        <div className="properties-section">
          <h2>Property Analytics</h2>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Properties by Type</h3>
              <div className="chart-wrapper">
                {analytics.propertyAnalytics?.byType && (
                  <Doughnut data={analytics.propertyAnalytics.byType} options={chartOptions} />
                )}
              </div>
            </div>
            
            <div className="chart-container">
              <h3>Price Range Distribution</h3>
              <div className="chart-wrapper">
                {analytics.propertyAnalytics?.byPriceRange && (
                  <Bar data={analytics.propertyAnalytics.byPriceRange} options={chartOptions} />
                )}
              </div>
            </div>
            
            <div className="chart-container">
              <h3>Location Distribution</h3>
              <div className="chart-wrapper">
                {analytics.propertyAnalytics?.byLocation && (
                  <PolarArea data={analytics.propertyAnalytics.byLocation} options={chartOptions} />
                )}
              </div>
            </div>
            
            <div className="chart-container">
              <h3>Property Types Treemap (D3.js)</h3>
              <div className="d3-chart" ref={treemapRef}></div>
            </div>
          </div>
        </div>
      )}

      {/* User Analytics */}
      {activeMetric === 'users' && (
        <div className="users-section">
          <h2>User Analytics</h2>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h3>User Demographics</h3>
              <div className="chart-wrapper">
                {analytics.userAnalytics?.demographics && (
                  <Bar data={analytics.userAnalytics.demographics} options={chartOptions} />
                )}
              </div>
            </div>
            
            <div className="chart-container">
              <h3>User Engagement Trends</h3>
              <div className="chart-wrapper">
                {analytics.userAnalytics?.engagement && (
                  <Line data={analytics.userAnalytics.engagement} options={chartOptions} />
                )}
              </div>
            </div>
            
            <div className="chart-container">
              <h3>User Retention</h3>
              <div className="chart-wrapper">
                {analytics.userAnalytics?.retention && (
                  <Pie data={analytics.userAnalytics.retention} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Analytics */}
      {activeMetric === 'market' && (
        <div className="market-section">
          <h2>Market Analytics</h2>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Price Index Trends</h3>
              <div className="chart-wrapper">
                {analytics.marketTrends?.priceIndex && (
                  <Line data={analytics.marketTrends.priceIndex} options={chartOptions} />
                )}
              </div>
            </div>
            
            <div className="chart-container">
              <h3>Inventory vs Sales</h3>
              <div className="chart-wrapper">
                {analytics.marketTrends?.inventory && (
                  <Bar data={analytics.marketTrends.inventory} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;