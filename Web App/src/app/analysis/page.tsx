'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-[#1e1e1e] rounded-lg shadow-md overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-700">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium text-gray-100">{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-400 mt-1">{children}</p>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
);

const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false
});

interface Detection {
  _id: string;
  camera: {
    _id: string;
    cameraId: string;
    location: {
      coordinates: [number, number]; // [longitude, latitude]
    };
    railwaySection: string;
  };
  detectedAt: string;
  animalType: string;
  confidence: number;
  status: string;
}

interface HeatmapPoint {
  location: [number, number];
  weight: number;
  details: {
    cameraId: string;
    detections: number;
    animalTypes: Record<string, number>;
    railwaySection: string;
  };
}

const ANIMAL_COLORS: Record<string, string> = {
  'elephant': '#8884d8',
  'deer': '#82ca9d',
  'cattle': '#ffc658',
  'wild_boar': '#ff8042',
  'dog': '#0088FE',
  'cat': '#00C49F',
  'unknown': '#FFBB28',
  'other': '#FF8042'
};

export default function AnalysisPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [railwaySection, setRailwaySection] = useState('all');
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  useEffect(() => {
    fetchData();
  }, [timeRange, animalFilter, railwaySection, dateFrom, dateTo]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let apiUrl = `/api/detections?page=1&limit=1000`;
      
      if (animalFilter !== 'all') {
        apiUrl += `&animalType=${animalFilter}`;
      }
      
      if (railwaySection !== 'all') {
        apiUrl += `&railwaySection=${railwaySection}`;
      }
      
      if (dateFrom) {
        apiUrl += `&startDate=${new Date(dateFrom).toISOString()}`;
      }
      
      if (dateTo) {
        apiUrl += `&endDate=${new Date(dateTo).toISOString()}`;
      }
      
      const response = await fetch(apiUrl);
      const result = await response.json();
      
      setDetections(result.data);
      
      const sections = Array.from(new Set(result.data.map((d: Detection) => d.camera.railwaySection)));
      setAvailableSections(['all', ...sections]);
      
      // Process data for heatmap
      processHeatmapData(result.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processHeatmapData = (data: Detection[]) => {
    // Group by camera location
    const locationMap = new Map<string, HeatmapPoint>();
    
    data.forEach(detection => {
      const locationKey = detection.camera.location.coordinates.join(',');
      
      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          location: detection.camera.location.coordinates,
          weight: 0,
          details: {
            cameraId: detection.camera.cameraId,
            detections: 0,
            animalTypes: {},
            railwaySection: detection.camera.railwaySection
          }
        });
      }
      
      const point = locationMap.get(locationKey)!;
      point.weight += 1;
      point.details.detections += 1;
      
      if (!point.details.animalTypes[detection.animalType]) {
        point.details.animalTypes[detection.animalType] = 0;
      }
      point.details.animalTypes[detection.animalType] += 1;
    });
    
    setHeatmapData(Array.from(locationMap.values()));
  };

  const getAnimalCountsByType = () => {
    const counts: Record<string, number> = {};
    
    detections.forEach(detection => {
      if (!counts[detection.animalType]) {
        counts[detection.animalType] = 0;
      }
      counts[detection.animalType] += 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getDetectionsByTimeframe = () => {
    // Group detections by day/week/month based on timeRange
    const groupedData: Record<string, number> = {};
    
    detections.forEach(detection => {
      let timeKey;
      const date = new Date(detection.detectedAt);
      
      if (timeRange === 'day') {
        timeKey = `${date.getHours()}:00`;
      } else if (timeRange === 'week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        timeKey = days[date.getDay()];
      } else { // month
        timeKey = `${date.getDate()}/${date.getMonth() + 1}`;
      }
      
      if (!groupedData[timeKey]) {
        groupedData[timeKey] = 0;
      }
      groupedData[timeKey] += 1;
    });
    
    // Convert to array format
    return Object.entries(groupedData).map(([name, value]) => ({ name, value }));
  };

  const getDetectionsBySection = () => {
    const sectionCounts: Record<string, number> = {};
    
    detections.forEach(detection => {
      const section = detection.camera.railwaySection;
      if (!sectionCounts[section]) {
        sectionCounts[section] = 0;
      }
      sectionCounts[section] += 1;
    });
    
    return Object.entries(sectionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by count descending
  };

  const getTrendData = () => {
    // Get detection counts by day for the date range
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const dailyCounts: Record<string, number> = {};
    
    // Initialize all days with 0
    for (let i = 0; i <= days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      dailyCounts[dateStr] = 0;
    }
    
    // Fill in actual counts
    detections.forEach(detection => {
      const date = new Date(detection.detectedAt);
      if (date >= start && date <= end) {
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        if (dailyCounts[dateStr] !== undefined) {
          dailyCounts[dateStr] += 1;
        }
      }
    });
    
    // Convert to array
    return Object.entries(dailyCounts)
      .map(([name, value]) => ({ name, value }));
  };

  // Simple bar chart component
  const BarChart = ({ data, title }: { data: {name: string, value: number}[], title: string }) => {
    const max = Math.max(...data.map(item => item.value));
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-100">{title}</h4>
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center">
              <span className="text-sm w-24 truncate text-gray-300">{item.name}</span>
              <div className="flex-1 ml-2">
                <div className="relative h-6 bg-gray-700 rounded">
                  <div 
                    className="absolute top-0 left-0 h-6 bg-blue-500 rounded" 
                    style={{ width: `${(item.value / max) * 100}%` }}
                  ></div>
                  <span className="absolute top-0 left-2 text-sm text-white h-6 flex items-center">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple pie chart component
  const PieChart = ({ data, title }: { data: {name: string, value: number}[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-100">{title}</h4>
        <div className="flex items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 100 100">
            {data.map((item, i) => {
              const startAngle = currentAngle;
              const percentage = item.value / total;
              const angle = percentage * 360;
              currentAngle += angle;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              return (
                <path
                  key={i}
                  d={pathData}
                  fill={ANIMAL_COLORS[item.name] || `hsl(${i * 50}, 70%, 50%)`}
                  stroke="#fff"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, i) => (
            <div key={i} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1 rounded-sm"
                style={{ backgroundColor: ANIMAL_COLORS[item.name] || `hsl(${i * 50}, 70%, 50%)` }}
              ></div>
              <span className="text-xs text-gray-300">{item.name}: {Math.round(item.value / total * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="  w-full px-16 py-8 bg-[#121212] min-h-screen">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 text-gray-100">Wildlife Detection Analysis</h1>
        <p className="text-gray-400 mb-6">
          Interactive dashboard showing animal detection patterns and hotspots
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Time Period</label>
            <select 
              className="w-full rounded-md border border-gray-600 p-2 bg-[#1e1e1e] text-gray-100"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="day">By Hour</option>
              <option value="week">By Day of Week</option>
              <option value="month">By Day of Month</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Animal Type</label>
            <select 
              className="w-full rounded-md border border-gray-600 p-2 bg-[#1e1e1e] text-gray-100"
              value={animalFilter}
              onChange={(e) => setAnimalFilter(e.target.value)}
            >
              <option value="all">All Animals</option>
              <option value="elephant">Elephant</option>
              <option value="deer">Deer</option>
              <option value="cattle">Cattle</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="wild_boar">Wild Boar</option>
              <option value="unknown">Unknown</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Railway Section</label>
            <select 
              className="w-full rounded-md border border-gray-600 p-2 bg-[#1e1e1e] text-gray-100"
              value={railwaySection}
              onChange={(e) => setRailwaySection(e.target.value)}
            >
              {availableSections.map(section => (
                <option key={section} value={section}>
                  {section === 'all' ? 'All Sections' : section}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date From</label>
              <input 
                type="date" 
                className="w-full rounded-md border border-gray-600 p-2 bg-[#1e1e1e] text-gray-100"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date To</label>
              <input 
                type="date" 
                className="w-full rounded-md border border-gray-600 p-2 bg-[#1e1e1e] text-gray-100"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mb-6">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
          <button 
            className="px-4 py-2 bg-gray-700 text-gray-100 rounded-md hover:bg-gray-600 transition-colors"
          >
            Export Data
          </button>
        </div>
      </motion.div>
      
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="flex -mb-px">
            {/* <button
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'map' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
              onClick={() => setActiveTab('trends')}
            >
              Hotspot Map
            </button> */}
            <button
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'stats' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
            <button
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'trends' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
              onClick={() => setActiveTab('trends')}
            >
              Trends
            </button>
          </nav>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'map' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Detection Hotspots</CardTitle>
                  <CardDescription>
                    Heat map showing concentration of animal detections along railway tracks.
                    {detections.length > 0 ? ` Showing ${detections.length} detections.` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 md:h-[600px] w-full">
                    <MapWithNoSSR 
                      heatmapData={heatmapData}
                      center={heatmapData.length > 0 ? heatmapData[0].location : [78.9629, 20.5937]} // Default to center of India
                      zoom={heatmapData.length > 0 ? 8 : 5}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {activeTab === 'stats' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Animal Type Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of detected animals by type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PieChart 
                      data={getAnimalCountsByType()} 
                      title="Distribution by Animal Type"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Detection by Time</CardTitle>
                    <CardDescription>
                      {timeRange === 'day' ? 'Hourly' : timeRange === 'week' ? 'Daily' : 'Monthly'} distribution of detections
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart 
                      data={getDetectionsByTimeframe()} 
                      title={`Detections by ${timeRange === 'day' ? 'Hour' : timeRange === 'week' ? 'Day' : 'Date'}`}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Railway Section Analysis</CardTitle>
                    <CardDescription>
                      Top 10 sections by detection count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart 
                      data={getDetectionsBySection().slice(0, 10)} 
                      title="Detections by Railway Section" 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Summary Statistics</CardTitle>
                    <CardDescription>
                      Key metrics from detection data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1e1e1e] p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Total Detections</p>
                        <p className="text-2xl font-bold text-gray-100">{detections.length}</p>
                      </div>
                      <div className="bg-[#1e1e1e] p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Unique Cameras</p>
                        <p className="text-2xl font-bold text-gray-100">
                          {new Set(detections.map(d => d.camera._id)).size}
                        </p>
                      </div>
                      <div className="bg-[#1e1e1e] p-4 rounded-lg">
                        <p className="text-sm text-gray-400">High Confidence</p>
                        <p className="text-2xl font-bold text-gray-100">
                          {detections.filter(d => d.confidence >= 80).length}
                        </p>
                      </div>
                      <div className="bg-[#1e1e1e] p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Animal Types</p>
                        <p className="text-2xl font-bold text-gray-100">
                          {new Set(detections.map(d => d.animalType)).size}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'trends' && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Detection Trends</CardTitle>
                  <CardDescription>
                    Daily trend of animal detections over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <div className="h-full flex flex-col">
                      <div className="flex-1 relative">
                        {getTrendData().map((item, i, arr) => {
                          const max = Math.max(...arr.map(d => d.value));
                          const percentage = max === 0 ? 0 : (item.value / max) * 100;
                          
                          return (
                            <div 
                              key={i}
                              className="absolute bottom-0 bg-blue-500 rounded-t"
                              style={{
                                left: `${(i / arr.length) * 100}%`,
                                width: `${100 / arr.length - 1}%`,
                                height: `${percentage}%`
                              }}
                              title={`${item.name}: ${item.value}`}
                            ></div>
                          );
                        })}
                      </div>
                      <div className="h-6 flex">
                        {getTrendData().map((item, i, arr) => (
                          i % Math.ceil(arr.length / 10) === 0 && (
                            <div 
                              key={i}
                              className="text-xs text-gray-400 text-center"
                              style={{
                                width: `${(100 / arr.length) * Math.ceil(arr.length / 10)}%`,
                                marginLeft: i === 0 ? 0 : `${(100 / arr.length) * (i - Math.ceil(arr.length / 10))}%`
                              }}
                            >
                              {item.name}
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Active Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getDetectionsBySection().slice(0, 5).map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-gray-700">
                          <span className="text-sm text-gray-300">{item.name}</span>
                          <span className="font-medium text-gray-100">{item.value} detections</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Common Animals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getAnimalCountsByType()
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                        .map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b border-gray-700">
                            <span className="text-sm text-gray-300">{item.name}</span>
                            <span className="font-medium text-gray-100">{item.value} detections</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Detection Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(
                        detections.reduce((acc, det) => {
                          if (!acc[det.status]) acc[det.status] = 0;
                          acc[det.status]++;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([status, count], i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-gray-700">
                          <span className="text-sm text-gray-300 capitalize">{status.replace('_', ' ')}</span>
                          <span className="font-medium text-gray-100">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}