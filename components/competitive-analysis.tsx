"use client"

import {
  Bar,
  BarChart,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Données de production des concurrents
const competitorsProductionData = [
  {
    name: "Notre Équipe",
    tech1: 450,
    tech4: 380,
  },
  {
    name: "Concurrent 1",
    tech1: 420,
    tech4: 350,
  },
  {
    name: "Concurrent 2",
    tech1: 380,
    tech4: 400,
  },
  {
    name: "Concurrent 3",
    tech1: 350,
    tech4: 320,
  },
  {
    name: "Concurrent 4",
    tech1: 300,
    tech4: 280,
  },
  {
    name: "Concurrent 5",
    tech1: 280,
    tech4: 260,
  },
  {
    name: "Concurrent 6",
    tech1: 260,
    tech4: 240,
  },
  {
    name: "Concurrent 7",
    tech1: 240,
    tech4: 220,
  },
  {
    name: "Concurrent 8",
    tech1: 220,
    tech4: 200,
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

// Données d'évolution des parts de marché
const marketShareEvolutionData = [
  {
    tour: "Tour 1",
    "Notre Équipe": 14.2,
    "Concurrent 1": 13.5,
    "Concurrent 2": 12.8,
  },
  {
    tour: "Tour 2",
    "Notre Équipe": 15.1,
    "Concurrent 1": 14.2,
    "Concurrent 2": 13.5,
  },
  {
    tour: "Tour 3",
    "Notre Équipe": 15.7,
    "Concurrent 1": 14.8,
    "Concurrent 2": 14.2,
  },
  {
    tour: "Tour 4",
    "Notre Équipe": 16.2,
    "Concurrent 1": 15.1,
    "Concurrent 2": 14.5,
  },
  {
    tour: "Tour 5",
    "Notre Équipe": 16.8,
    "Concurrent 1": 15.2,
    "Concurrent 2": 14.7,
  },
]

export function CompetitiveAnalysis() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Production des Concurrents</CardTitle>
          <CardDescription>Production des technologies 1 et 4 par concurrent</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={competitorsProductionData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tech1" name="Technologie 1" fill="#8884d8" />
              <Bar dataKey="tech4" name="Technologie 4" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Analyse Comparative</CardTitle>
          <CardDescription>Comparaison radar avec les principaux concurrents</CardDescription>
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
          <CardTitle>Évolution des Parts de Marché</CardTitle>
          <CardDescription>Évolution comparative des parts de marché</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={marketShareEvolutionData}
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
              <Line type="monotone" dataKey="Notre Équipe" stroke="#8884d8" />
              <Line type="monotone" dataKey="Concurrent 1" stroke="#82ca9d" />
              <Line type="monotone" dataKey="Concurrent 2" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tableau Comparatif</CardTitle>
          <CardDescription>Détails des principaux concurrents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Équipe</TableHead>
                <TableHead>Part de Marché</TableHead>
                <TableHead>Techno 1</TableHead>
                <TableHead>Techno 4</TableHead>
                <TableHead>Couverture</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Notre Équipe</TableCell>
                <TableCell>16.8%</TableCell>
                <TableCell>450</TableCell>
                <TableCell>380</TableCell>
                <TableCell>85%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Concurrent 1</TableCell>
                <TableCell>15.2%</TableCell>
                <TableCell>420</TableCell>
                <TableCell>350</TableCell>
                <TableCell>80%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Concurrent 2</TableCell>
                <TableCell>14.7%</TableCell>
                <TableCell>380</TableCell>
                <TableCell>400</TableCell>
                <TableCell>75%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Concurrent 3</TableCell>
                <TableCell>13.5%</TableCell>
                <TableCell>350</TableCell>
                <TableCell>320</TableCell>
                <TableCell>70%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

