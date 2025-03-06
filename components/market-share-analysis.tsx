"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Données d'évolution des parts de marché
const marketShareData = [
  {
    tour: "Tour 1",
    partMarcheEurope: 14.2,
    partTechnoEurope: 16.5,
    partTechno1Europe: 18.7,
    partTechno4Europe: 12.3,
    partTechno4Global: 10.8,
  },
  {
    tour: "Tour 2",
    partMarcheEurope: 15.1,
    partTechnoEurope: 17.3,
    partTechno1Europe: 20.5,
    partTechno4Europe: 14.8,
    partTechno4Global: 12.5,
  },
  {
    tour: "Tour 3",
    partMarcheEurope: 15.7,
    partTechnoEurope: 18.2,
    partTechno1Europe: 22.4,
    partTechno4Europe: 16.8,
    partTechno4Global: 14.3,
  },
  {
    tour: "Tour 4",
    partMarcheEurope: 16.2,
    partTechnoEurope: 19.1,
    partTechno1Europe: 23.8,
    partTechno4Europe: 18.5,
    partTechno4Global: 15.7,
  },
  {
    tour: "Tour 5",
    partMarcheEurope: 16.8,
    partTechnoEurope: 20.3,
    partTechno1Europe: 25.2,
    partTechno4Europe: 20.1,
    partTechno4Global: 17.2,
  },
]

// Données pour le graphique radar
const radarData = [
  {
    subject: "Part Marché",
    "Notre Équipe": 16.8,
    "Concurrent 1": 15.2,
    "Concurrent 2": 14.7,
    fullMark: 25,
  },
  {
    subject: "Techno 1",
    "Notre Équipe": 25.2,
    "Concurrent 1": 22.8,
    "Concurrent 2": 18.5,
    fullMark: 30,
  },
  {
    subject: "Techno 4",
    "Notre Équipe": 20.1,
    "Concurrent 1": 18.3,
    "Concurrent 2": 21.5,
    fullMark: 30,
  },
  {
    subject: "Couverture",
    "Notre Équipe": 85,
    "Concurrent 1": 80,
    "Concurrent 2": 75,
    fullMark: 100,
  },
  {
    subject: "Prix",
    "Notre Équipe": 75,
    "Concurrent 1": 80,
    "Concurrent 2": 70,
    fullMark: 100,
  },
]

export function MarketShareAnalysis() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Évolution des Parts de Marché</CardTitle>
          <CardDescription>Évolution des différentes parts de marché au fil des tours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={marketShareData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tour" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="partMarcheEurope" name="Part Marché Europe" stroke="#8884d8" />
              <Line type="monotone" dataKey="partTechnoEurope" name="Part Techno Europe" stroke="#82ca9d" />
              <Line type="monotone" dataKey="partTechno1Europe" name="Part Techno 1 Europe" stroke="#ffc658" />
              <Line type="monotone" dataKey="partTechno4Europe" name="Part Techno 4 Europe" stroke="#ff8042" />
              <Line type="monotone" dataKey="partTechno4Global" name="Part Techno 4 Global" stroke="#0088fe" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Concurrentielle</CardTitle>
          <CardDescription>Analyse radar des parts de marché par rapport aux concurrents</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart outerRadius={90} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Notre Équipe" dataKey="Notre Équipe" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Concurrent 1" dataKey="Concurrent 1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="Concurrent 2" dataKey="Concurrent 2" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Évolution Technologie 4</CardTitle>
          <CardDescription>Évolution de la part de marché de la Technologie 4</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={marketShareData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tour" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Area
                type="monotone"
                dataKey="partTechno4Europe"
                name="Techno 4 Europe"
                stroke="#ff8042"
                fill="#ff8042"
              />
              <Area
                type="monotone"
                dataKey="partTechno4Global"
                name="Techno 4 Global"
                stroke="#0088fe"
                fill="#0088fe"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

