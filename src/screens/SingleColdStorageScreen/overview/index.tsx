import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/const";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";
import { Separator } from "@/components/ui/separator";
import { ArrowUp, ArrowDown, Warehouse, Award, Package, BarChart3 } from "lucide-react";

// Types for the API responses
interface Size {
  size: string;
  initialQuantity: number;
  currentQuantity: number;
}

interface VarietyData {
  variety: string;
  sizes: Size[];
}

interface StockSummaryResponse {
  status: string;
  stockSummary: VarietyData[];
}

interface BagSummary {
  [key: string]: number;
}

interface TopFarmer {
  _id: string;
  totalBags: number;
  bagSummary: BagSummary;
  farmerId: string;
  farmerName: string;
}

interface TopFarmersResponse {
  status: string;
  message: string;
  data: TopFarmer[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

interface OverviewTabProps {
  summaryData?: StockSummaryResponse;
  coldStorageId?: string;
}

// Modern, elegant color palette
const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#84cc16', // Lime
  '#14b8a6'  // Teal
];

const OverviewTab = ({ summaryData, coldStorageId }: OverviewTabProps) => {
  const [topFarmers, setTopFarmers] = useState<TopFarmersResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const admin = useSelector((state: RootState) => state.auth.adminInfo);

  // Process stock summary data for chart display
  const processStockData = () => {
    if (!summaryData) return [];

    return summaryData.stockSummary.map(item => {
      const totalQuantity = item.sizes.reduce((acc, size) => acc + size.currentQuantity, 0);

      return {
        name: item.variety,
        total: totalQuantity,
        ...item.sizes.reduce((acc, size) => ({
          ...acc,
          [size.size]: size.currentQuantity
        }), {})
      };
    });
  };

  // Process top farmers data for chart display
  const processTopFarmersData = () => {
    if (!topFarmers) return [];

    return topFarmers.data.map(farmer => ({
      name: farmer.farmerName,
      totalBags: farmer.totalBags,
      ...farmer.bagSummary
    }));
  };

  // Create pie chart data for size distribution across all varieties
  const createSizeDistributionData = () => {
    if (!summaryData) return [];

    // Aggregate quantities by size
    const sizeMap = new Map<string, number>();

    summaryData.stockSummary.forEach(variety => {
      variety.sizes.forEach(size => {
        const current = sizeMap.get(size.size) || 0;
        sizeMap.set(size.size, current + size.currentQuantity);
      });
    });

    // Convert to array format for chart
    return Array.from(sizeMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Calculate key insights from the data
  const calculateInsights = () => {
    if (!summaryData) return null;

    // Find top variety
    const chartData = processStockData();
    let topVariety = { name: '', total: 0 };
    let totalBags = 0;

    chartData.forEach(item => {
      totalBags += item.total;
      if (item.total > topVariety.total) {
        topVariety = { name: item.name, total: item.total };
      }
    });

    // Dominant size category
    const sizeData = createSizeDistributionData();
    let dominantSize = { name: '', value: 0, percentage: 0 };
    const totalSizeBags = sizeData.reduce((sum, item) => sum + item.value, 0);

    sizeData.forEach(item => {
      const percentage = (item.value / totalSizeBags) * 100;
      if (item.value > dominantSize.value) {
        dominantSize = {
          name: item.name,
          value: item.value,
          percentage: percentage
        };
      }
    });

    // Top farmer insights
    let topFarmerInsight = null;
    if (topFarmers && topFarmers.data.length > 0) {
      const topFarmer = topFarmers.data[0];
      const topFarmerPercentage = (topFarmer.totalBags / totalBags) * 100;

      // Get most common bag type for this farmer
      let topBagType = '';
      let topBagCount = 0;

      Object.entries(topFarmer.bagSummary).forEach(([type, count]) => {
        if (count > topBagCount) {
          topBagType = type;
          topBagCount = count;
        }
      });

      topFarmerInsight = {
        name: topFarmer.farmerName,
        totalBags: topFarmer.totalBags,
        percentage: topFarmerPercentage,
        topBagType,
        topBagCount
      };
    }

    return {
      totalInventory: totalBags,
      topVariety,
      dominantSize,
      topFarmerInsight
    };
  };

  const handleGetTopFarmers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/cold-storages/${coldStorageId}/top-farmers`,
        {
          headers: {
            Authorization: `Bearer ${admin?.token}`,
          },
        }
      );
      setTopFarmers(res.data);
    } catch (err) {
      console.error("Error fetching top farmers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top farmers data on component mount
  useEffect(() => {
    if (admin?.token && coldStorageId) {
      handleGetTopFarmers();
    }
  }, [admin?.token, coldStorageId]);

  const chartData = processStockData();
  const topFarmersData = processTopFarmersData();
  const sizeDistributionData = createSizeDistributionData();
  const insights = calculateInsights();

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-semibold text-gray-800 mb-1 text-sm">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 inline-block rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span>{`${entry.name}: ${entry.value}`}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  // Custom insight card components
  const InsightCard = ({ title, value, icon, color, description, subtext }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    description?: string;
    subtext?: string;
  }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      <div className="mt-1">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {description && <p className="text-sm font-medium text-gray-600 mt-1">{description}</p>}
        {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
      </div>
    </div>
  );

  return (


    <div className="sm:w-full lg:w-[1130px]  md:p-6 bg-gray-50">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Cold Storage Overview</h1>
        <p className="text-gray-600 mt-1 text-base">Current inventory and distribution statistics</p>
        <Separator className="mt-4" />
      </div>

      {/* Key Insights Summary Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <InsightCard
            title="Total Inventory"
            value={insights.totalInventory.toLocaleString()}
            icon={<Warehouse size={18} className="text-blue-500" />}
            color="bg-blue-50"
            description="Total bags stored"
          />

          <InsightCard
            title="Top Variety"
            value={insights.topVariety.name}
            icon={<Award size={18} className="text-purple-500" />}
            color="bg-purple-50"
            description={`${insights.topVariety.total.toLocaleString()} bags stored`}
            subtext={`${((insights.topVariety.total / insights.totalInventory) * 100).toFixed(1)}% of total inventory`}
          />

          <InsightCard
            title="Dominant Size"
            value={insights.dominantSize.name}
            icon={<Package size={18} className="text-pink-500" />}
            color="bg-pink-50"
            description={`${insights.dominantSize.value.toLocaleString()} bags`}
            subtext={`${insights.dominantSize.percentage.toFixed(1)}% of all bag sizes`}
          />

          {insights.topFarmerInsight && (
            <InsightCard
              title="Top Farmer"
              value={insights.topFarmerInsight.name}
              icon={<BarChart3 size={18} className="text-emerald-500" />}
              color="bg-emerald-50"
              description={`${insights.topFarmerInsight.totalBags.toLocaleString()} bags stored`}
              subtext={`Specializes in ${insights.topFarmerInsight.topBagType} (${insights.topFarmerInsight.topBagCount.toLocaleString()} bags)`}
            />
          )}
        </div>
      )}

      {/* Stock Summary Chart - Full width */}
      <section className="mb-8">
        <div className="flex flex-col space-y-1 mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Stock Summary by Variety</h2>
          <p className="text-gray-600 text-sm">Distribution of potato varieties by size category</p>
        </div>

        <div className="w-full bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          {!summaryData ? (
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : chartData.length > 0 ? (
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: '#4B5563', fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#4B5563', fontSize: 11 }}
                    width={50}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 15 }}
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    fontSize={11}
                  />
                  <Bar dataKey="Number-12" stackId="a" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Goli" stackId="a" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Seed" stackId="a" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cut-tok" stackId="a" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ration" stackId="a" fill={COLORS[4]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-500">No stock summary data available</p>
            </div>
          )}
        </div>
      </section>

      {/* Size Distribution Chart - Full Width */}
      <section className="mb-8">
        <div className="flex flex-col space-y-1 mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Size Distribution</h2>
          <p className="text-gray-600 text-sm">Percentage breakdown by potato size</p>
        </div>

        <div className="w-full bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          {!summaryData ? (
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : sizeDistributionData.length > 0 ? (
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left side - Pie chart */}
              <div className="h-[450px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sizeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={{ strokeWidth: 0.5, stroke: "#666" }}
                      outerRadius="80%"
                      innerRadius="40%"
                      paddingAngle={3}
                      dataKey="value"
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = 25 + innerRadius + (outerRadius - innerRadius);
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            fontSize={11}
                            fontWeight={500}
                          >
                            {`${sizeDistributionData[index].name}: ${(percent * 100).toFixed(1)}%`}
                          </text>
                        );
                      }}
                    >
                      {sizeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value.toLocaleString()} bags`, 'Quantity']} />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      fontSize={11}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Right side - Percentage bars and insights */}
              <div className="flex flex-col justify-center h-full p-3">
                <h3 className="text-base font-medium text-gray-800 mb-4">Size Distribution & Insights</h3>

                {/* Size Distribution Bars */}
                <div className="space-y-5 mb-6">
                  {sizeDistributionData.map((item, index) => {
                    const total = sizeDistributionData.reduce((sum, i) => sum + i.value, 0);
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2 inline-block"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></span>
                            <span className="font-medium">{item.name}</span>
                          </span>
                          <span>{item.value.toLocaleString()} bags ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all duration-500 ease-in-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Key Insights Box */}
                {insights && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-2 text-sm">Distribution Insights</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-blue-700">
                        <span className="mt-1"><Package size={14} /></span>
                        <span>
                          <strong>{insights.dominantSize.name}</strong> is the most common size at
                          <strong> {insights.dominantSize.percentage.toFixed(1)}%</strong> of all inventory
                        </span>
                      </li>
                      {sizeDistributionData.length > 2 && (
                        <li className="flex items-start gap-2 text-sm text-blue-700">
                          <span className="mt-1"><ArrowUp size={14} /></span>
                          <span>
                            Top 2 sizes account for
                            <strong> {(() => {
                              const sorted = [...sizeDistributionData].sort((a, b) => b.value - a.value);
                              const total = sorted.reduce((sum, item) => sum + item.value, 0);
                              const topTwoPercent = ((sorted[0].value + sorted[1].value) / total * 100).toFixed(1);
                              return topTwoPercent;
                            })()}%</strong> of inventory
                          </span>
                        </li>
                      )}
                      <li className="flex items-start gap-2 text-sm text-blue-700">
                        <span className="mt-1"><ArrowDown size={14} /></span>
                        <span>
                          {sizeDistributionData.sort((a, b) => a.value - b.value)[0].name} has the lowest inventory at
                          <strong> {(() => {
                            const smallest = [...sizeDistributionData].sort((a, b) => a.value - b.value)[0];
                            const total = sizeDistributionData.reduce((sum, item) => sum + item.value, 0);
                            return ((smallest.value / total) * 100).toFixed(1);
                          })()}%</strong>
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-500">No size distribution data available</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Farmers Chart - Full width */}
      <section className="mb-6">
        <div className="flex flex-col space-y-1 mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Top Farmers</h2>
          <p className="text-gray-600 text-sm">Farmers with the highest storage inventory by bag type</p>
        </div>

        <div className="w-full bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          {loading && !topFarmers ? (
            <div className="h-96 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : topFarmersData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left side - Chart */}
              <div className="lg:col-span-3 h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topFarmersData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 110 }}
                    barGap={6}
                    barSize={24}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: '#4B5563', fontSize: 11 }}
                      interval={0}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: '#4B5563', fontSize: 11 }}
                      width={50}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: 15 }}
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      fontSize={11}
                    />
                    <Bar dataKey="totalBags" fill={COLORS[5]} name="Total Bags" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cut-tok" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Goli" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Number-12" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Ration" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Seed" fill={COLORS[4]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Right side - Key insights */}
              <div className="lg:col-span-1 flex flex-col justify-center space-y-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <h4 className="font-medium text-amber-800 mb-3 text-sm">Top Farmer Insights</h4>

                  {topFarmersData.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-amber-700 text-xs font-medium">Top Contributor</span>
                          <span className="text-amber-800 text-xs font-bold">{topFarmersData[0].totalBags.toLocaleString()} bags</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-amber-600" />
                          <span className="text-sm font-semibold text-amber-900">{topFarmersData[0].name}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200">
                        <div className="text-xs font-medium text-amber-700 mb-1">Specialty Breakdown</div>
                        {(() => {
                          const farmer = topFarmersData[0];
                          const bagTypes = Object.keys(farmer).filter(key =>
                            key !== 'name' && key !== 'totalBags'
                          );

                          const sorted = bagTypes.sort((a, b) => farmer[b] - farmer[a]);
                          const topType = sorted[0];

                          if (!topType) return null;

                          const percentage = ((farmer[topType] / farmer.totalBags) * 100).toFixed(1);

                          return (
                            <div className="flex items-center gap-2 text-sm text-amber-900">
                              <span className="font-semibold">{topType}:</span>
                              <span>{farmer[topType].toLocaleString()} bags ({percentage}%)</span>
                            </div>
                          );
                        })()}
                      </div>

                      {topFarmersData.length >= 2 && (
                        <div className="pt-2 border-t border-amber-200">
                          <div className="text-xs font-medium text-amber-700 mb-1">Comparison</div>
                          <div className="text-sm text-amber-900">
                            Stores <span className="font-semibold">
                              {(topFarmersData[0].totalBags / topFarmersData[1].totalBags).toFixed(1)}x
                            </span> more than second-ranked farmer
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {topFarmersData.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3 text-sm">Storage Share</h4>
                    <div className="flex items-end gap-1">
                      <div className="text-3xl font-bold text-gray-900">
                        {(() => {
                          if (!insights) return '0%';
                          const totalInventory = insights.totalInventory;
                          const topFarmerBags = topFarmersData[0].totalBags;
                          return `${((topFarmerBags / totalInventory) * 100).toFixed(1)}%`;
                        })()}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">of total inventory</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <Button
                onClick={handleGetTopFarmers}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-5 py-2 rounded-lg"
              >
                Load Top Farmers
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;