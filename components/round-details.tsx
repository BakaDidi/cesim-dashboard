"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Données simulées pour un tour spécifique
const roundData = {
  id: "3",
  numero: 3,
  date: "01/03/2023",
  commentaires: "Expansion sur le marché européen",
  financials: {
    revenuEurope: 1420000,
    revenuGlobal: 2350000,
    beneficeNetEurope: 430000,
    beneficeNetGlobal: 680000,
    rendementCumulatif: 12.5,
  },
  marketShare: {
    partMarcheEurope: 15.7,
    partTechnoEurope: 18.2,
    partTechno1Europe: 22.4,
    partTechno4Europe: 16.8,
    partTechno4Global: 14.3,
  },
  hr: {
    employesRD: 45,
    tauxRotation: 8.2,
    budgetFormation: 120000,
  },
}

// Données d'évolution pour les graphiques
const evolutionData = [
  {
    tour: "Tour 1",
    revenuEurope: 1200000,
    revenuGlobal: 2100000,
    beneficeNetEurope: 350000,
    beneficeNetGlobal: 580000,
    partMarche: 14.2,
    employesRD: 35,
  },
  {
    tour: "Tour 2",
    revenuEurope: 1350000,
    revenuGlobal: 2280000,
    beneficeNetEurope: 410000,
    beneficeNetGlobal: 650000,
    partMarche: 15.1,
    employesRD: 40,
  },
  {
    tour: "Tour 3",
    revenuEurope: 1420000,
    revenuGlobal: 2350000,
    beneficeNetEurope: 430000,
    beneficeNetGlobal: 680000,
    partMarche: 15.7,
    employesRD: 45,
  },
]

// Données des concurrents
const competitorsData = [
  { name: "Notre Équipe", tech1: 450, tech4: 380 },
  { name: "Concurrent 1", tech1: 420, tech4: 350 },
  { name: "Concurrent 2", tech1: 380, tech4: 400 },
  { name: "Concurrent 3", tech1: 350, tech4: 320 },
  { name: "Concurrent 4", tech1: 300, tech4: 280 },
]

interface RoundDetailsProps {
  id: string
}

export function RoundDetails({ id }: RoundDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenu Europe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                roundData.financials.revenuEurope,
              )}
            </div>
            <p className="text-xs text-muted-foreground">+5.2% par rapport au tour précédent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenu Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                roundData.financials.revenuGlobal,
              )}
            </div>
            <p className="text-xs text-muted-foreground">+3.1% par rapport au tour précédent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Part de Marché</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roundData.marketShare.partMarcheEurope}%</div>
            <p className="text-xs text-muted-foreground">+0.6% par rapport au tour précédent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employés R&D</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roundData.hr.employesRD}</div>
            <p className="text-xs text-muted-foreground">+5 par rapport au tour précédent</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financial">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="market">Parts de Marché</TabsTrigger>
          <TabsTrigger value="competitors">Concurrents</TabsTrigger>
        </TabsList>
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Évolution Financière</CardTitle>
              <CardDescription>Évolution des revenus et bénéfices nets au fil des tours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={evolutionData}
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
                  <Tooltip
                    formatter={(value) =>
                      `${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value as number)}`
                    }
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenuEurope" name="Revenu Europe" stroke="#8884d8" />
                  <Line type="monotone" dataKey="revenuGlobal" name="Revenu Global" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="beneficeNetEurope" name="Bénéfice Net Europe" stroke="#ffc658" />
                  <Line type="monotone" dataKey="beneficeNetGlobal" name="Bénéfice Net Global" stroke="#ff8042" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Parts de Marché</CardTitle>
              <CardDescription>Évolution de la part de marché en Europe</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={evolutionData}
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
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="partMarche" name="Part de Marché" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Analyse Concurrentielle</CardTitle>
              <CardDescription>Production des technologies 1 et 4 en Europe par concurrent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={competitorsData}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

