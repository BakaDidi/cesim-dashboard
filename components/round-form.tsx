"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const competitorSchema = z.object({
  nom: z.string().min(1, { message: "Le nom du concurrent est requis" }),
  chiffreAffairesEurope: z.coerce.number().min(0),
  chiffreAffairesGlobal: z.coerce.number().min(0),
  resultatNetEurope: z.coerce.number(),
  resultatNetGlobal: z.coerce.number(),
  retourCumuleActionnaires: z.coerce.number(),
  partMarcheEurope: z.coerce.number().min(0).max(100),
  partTechnologieEurope: z.coerce.number().min(0).max(100),
  partTechno1Europe: z.coerce.number().min(0).max(100),
  partTechno4Europe: z.coerce.number().min(0).max(100),
  partTechno4Global: z.coerce.number().min(0).max(100),
  employesRD: z.coerce.number().min(0),
  tauxRotation: z.coerce.number().min(0).max(100),
  productionTech1Europe: z.coerce.number().min(0),
  productionTech4Europe: z.coerce.number().min(0),
  prixVenteTech1Europe: z.coerce.number().min(0).optional(),
  prixVenteTech2Europe: z.coerce.number().min(0).optional(),
  prixVenteTech3Europe: z.coerce.number().min(0).optional(),
  prixVenteTech4Europe: z.coerce.number().min(0).optional(),
  fonctionnalitesTech1: z.coerce.number().min(0).optional(),
  fonctionnalitesTech2: z.coerce.number().min(0).optional(),
  fonctionnalitesTech3: z.coerce.number().min(0).optional(),
  fonctionnalitesTech4: z.coerce.number().min(0).optional(),
  strategieMarketingTech1: z.string().optional(),
  strategieMarketingTech2: z.string().optional(),
  strategieMarketingTech3: z.string().optional(),
  strategieMarketingTech4: z.string().optional(),
  ventesTech1Europe: z.coerce.number().min(0).optional(),
  ventesTech2Europe: z.coerce.number().min(0).optional(),
  ventesTech3Europe: z.coerce.number().min(0).optional(),
  ventesTech4Europe: z.coerce.number().min(0).optional(),
  demandeTech1Europe: z.coerce.number().min(0).optional(),
  demandeTech2Europe: z.coerce.number().min(0).optional(),
  demandeTech3Europe: z.coerce.number().min(0).optional(),
  demandeTech4Europe: z.coerce.number().min(0).optional(),
})

const formSchema = z.object({
  numero: z.coerce.number().min(1, {
    message: "Le numéro du tour doit être supérieur à 0.",
  }),
  date: z.string().min(1, {
    message: "La date est requise.",
  }),
  commentaires: z.string().optional(),
  revenuEurope: z.coerce.number().min(0, {
    message: "Le revenu doit être un nombre positif.",
  }),
  revenuGlobal: z.coerce.number().min(0, {
    message: "Le revenu doit être un nombre positif.",
  }),
  beneficeNetEurope: z.coerce.number(),
  beneficeNetGlobal: z.coerce.number(),
  rendementCumulatif: z.coerce.number(),
  partMarcheEurope: z.coerce.number().min(0).max(100, {
    message: "La part de marché doit être entre 0 et 100%.",
  }),
  partTechnoEurope: z.coerce.number().min(0).max(100, {
    message: "La part de technologie doit être entre 0 et 100%.",
  }),
  partTechno1Europe: z.coerce.number().min(0).max(100, {
    message: "La part de technologie 1 doit être entre 0 et 100%.",
  }),
  partTechno4Europe: z.coerce.number().min(0).max(100, {
    message: "La part de technologie 4 doit être entre 0 et 100%.",
  }),
  partTechno4Global: z.coerce.number().min(0).max(100, {
    message: "La part de technologie 4 doit être entre 0 et 100%.",
  }),
  employesRD: z.coerce.number().min(0, {
    message: "Le nombre d'employés doit être positif.",
  }),
  tauxRotation: z.coerce.number().min(0).max(100, {
    message: "Le taux de rotation doit être entre 0 et 100%.",
  }),
  budgetFormation: z.coerce.number().min(0, {
    message: "Le budget de formation doit être positif.",
  }),
  competitors: z.array(competitorSchema).min(8, { message: "Il doit y avoir au moins 8 concurrents" }),
})

export function RoundForm({ initialData = null }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      numero: 1,
      date: new Date().toLocaleDateString("fr-FR"),
      commentaires: "",
      revenuEurope: 0,
      revenuGlobal: 0,
      beneficeNetEurope: 0,
      beneficeNetGlobal: 0,
      rendementCumulatif: 0,
      partMarcheEurope: 0,
      partTechnoEurope: 0,
      partTechno1Europe: 0,
      partTechno4Europe: 0,
      partTechno4Global: 0,
      employesRD: 0,
      tauxRotation: 0,
      budgetFormation: 0,
      competitors: Array(8).fill({
        nom: "",
        chiffreAffairesEurope: 0,
        chiffreAffairesGlobal: 0,
        resultatNetEurope: 0,
        resultatNetGlobal: 0,
        retourCumuleActionnaires: 0,
        partMarcheEurope: 0,
        partTechnologieEurope: 0,
        partTechno1Europe: 0,
        partTechno4Europe: 0,
        partTechno4Global: 0,
        employesRD: 0,
        tauxRotation: 0,
        productionTech1Europe: 0,
        productionTech4Europe: 0,
        prixVenteTech1Europe: 0,
        prixVenteTech2Europe: 0,
        prixVenteTech3Europe: 0,
        prixVenteTech4Europe: 0,
        fonctionnalitesTech1: 0,
        fonctionnalitesTech2: 0,
        fonctionnalitesTech3: 0,
        fonctionnalitesTech4: 0,
        strategieMarketingTech1: "",
        strategieMarketingTech2: "",
        strategieMarketingTech3: "",
        strategieMarketingTech4: "",
        ventesTech1Europe: 0,
        ventesTech2Europe: 0,
        ventesTech3Europe: 0,
        ventesTech4Europe: 0,
        demandeTech1Europe: 0,
        demandeTech2Europe: 0,
        demandeTech3Europe: 0,
        demandeTech4Europe: 0,
      }),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/rounds", {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission du formulaire")
      }

      router.push("/rounds")
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="financial">Financier</TabsTrigger>
            <TabsTrigger value="market">Parts de Marché</TabsTrigger>
            <TabsTrigger value="hr">Ressources Humaines</TabsTrigger>
            <TabsTrigger value="competitors">Concurrents</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
                <CardDescription>Saisissez les informations de base du tour de simulation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro du Tour</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>Format: JJ/MM/AAAA</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="commentaires"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaires</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ajoutez des notes ou commentaires sur ce tour..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Performance Financière</CardTitle>
                <CardDescription>Saisissez les données financières du tour.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="revenuEurope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revenu Europe (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="revenuGlobal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revenu Global (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="beneficeNetEurope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bénéfice Net Europe (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="beneficeNetGlobal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bénéfice Net Global (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="rendementCumulatif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rendement Cumulatif aux Actionnaires (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="market">
            <Card>
              <CardHeader>
                <CardTitle>Parts de Marché</CardTitle>
                <CardDescription>Saisissez les données de parts de marché.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="partMarcheEurope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part de Marché Europe (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partTechnoEurope"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Technologique Europe (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="partTechno1Europe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Techno 1 Europe (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partTechno4Europe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Techno 4 Europe (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="partTechno4Global"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Part Techno 4 Global (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hr">
            <Card>
              <CardHeader>
                <CardTitle>Ressources Humaines</CardTitle>
                <CardDescription>Saisissez les données relatives aux ressources humaines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="employesRD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employés R&D</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tauxRotation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taux de Rotation (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budgetFormation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Formation (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="competitors">
            <Card>
              <CardHeader>
                <CardTitle>Concurrents</CardTitle>
                <CardDescription>Saisissez les données des concurrents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.watch("competitors").map((_, index) => (
                  <div key={index} className="space-y-4 border p-4 rounded">
                    <h3 className="text-lg font-semibold">Concurrent {index + 1}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.nom`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du Concurrent</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.chiffreAffairesEurope`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chiffre d'affaires Europe (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.chiffreAffairesGlobal`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chiffre d'affaires Global (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.resultatNetEurope`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Résultat Net Europe (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.resultatNetGlobal`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Résultat Net Global (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.retourCumuleActionnaires`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retour Cumulé Actionnaires (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.partMarcheEurope`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part de Marché Europe (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.partTechnologieEurope`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Technologie Europe (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.partTechno1Europe`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Techno 1 Europe (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.partTechno4Europe`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Techno 4 Europe (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.partTechno4Global`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Part Techno 4 Global (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.employesRD`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employés R&D</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.tauxRotation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Taux de Rotation (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.productionTech1Europe`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Production Tech 1 Europe</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`competitors.${index}.productionTech4Europe`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Production Tech 4 Europe</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Détails par technologie</h4>
                      {[1, 2, 3, 4].map((tech) => (
                        <div key={tech} className="grid grid-cols-4 gap-2">
                          <FormField
                            control={form.control}
                            name={`competitors.${index}.prixVenteTech${tech}Europe`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prix Tech {tech} (€)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`competitors.${index}.fonctionnalitesTech${tech}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fonctionnalités Tech {tech}</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`competitors.${index}.strategieMarketingTech${tech}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stratégie Marketing Tech {tech}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`competitors.${index}.ventesTech${tech}Europe`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ventes Tech {tech} Europe (k unités)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`competitors.${index}.demandeTech${tech}Europe`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Demande Tech {tech} Europe (k unités)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.push("/rounds")}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

