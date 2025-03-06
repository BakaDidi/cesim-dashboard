"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Données de production par technologie
const techProductionData = [
  {
    name: "Notre Équipe",
    "Techno 1": 450,
    "Techno 2": 320,
    "Techno 3": 280,
    "Techno 4": 380,
  },
  {
    name: "Concurrent 1",
    "Techno 1": 420,
    "Techno 2": 340,
    "Techno 3": 260,
    "Techno 4": 350,
  },
  {
    name: "Concurrent 2",
    "Techno 1": 380,
    "Techno 2": 300,
    "Techno 3": 290,
    "Techno 4": 400,
  },
  {
    name: "Concurrent 3",
    "Techno 1": 350,
    "Techno 2": 280,
    "Techno 3": 250,
    "Techno 4": 320,
  },
  {
    name: "Concurrent 4",
    "Techno 1": 300,
    "Techno 2": 260,
    "Techno 3": 230,
    "Techno 4": 280,
  },
]

// Données d'évolution de la production
const productionEvolutionData = [
  {
    tour: "Tour 1",
    "Techno 1": 380,
    "Techno 4": 320,
  },
  {
    tour: "Tour 2",
    "Techno 1": 410,
    "Techno 4": 340,
  },
  {
    tour: "Tour 3",
    "Techno 1": 450,
    "Techno 4": 380,
  },
  {
    tour: "Tour 4",
    "Techno 1": 480,
    "Techno 4": 410,
  },
  {
    tour: "Tour 5",
    "Techno 1": 520,
    "Techno 4": 450,
  },
]

// Données de couverture réseau
const networkCoverageData = [
  {
    name: "Notre Équipe",
    couverture: 85,
  },
  {
    name: "Concurrent 1",
    couverture: 80,
  },
  {
    name: "Concurrent 2",
    couverture: 75,
  },
  {
    name: "Concurrent 3",
    couverture: 70,
  },
  {
    name: "Concurrent 4",
    couverture: 65,
  },
]

export function TechnologyAnalysis() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Production par Technologie</CardTitle>
          <CardDescription>Comparaison de la production par technologie entre les équipes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={techProductionData}
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
              <Bar dataKey="Techno 1" fill="#8884d8" />
              <Bar dataKey="Techno 2" fill="#82ca9d" />
              <Bar dataKey="Techno 3" fill="#ffc658" />
              <Bar dataKey="Techno 4" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Évolution de la Production</CardTitle>
          <CardDescription>Évolution de la production des technologies 1 et 4</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={productionEvolutionData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Techno 1" fill="#8884d8" />
              <Bar dataKey="Techno 4" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Couverture Réseau</CardTitle>
          <CardDescription>Comparaison de la couverture réseau entre les équipes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={networkCoverageData}
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
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="couverture" name="Couverture Réseau (%)" fill="#0088fe" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

