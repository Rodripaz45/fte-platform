"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Search, LogOut, Shield, Calendar, FileCheck, Users, MessageSquare, FileText, BookOpen } from "lucide-react";
import TalleresView from "@/components/dashboard/TalleresView";
import BusquedaPuestosView from "@/components/dashboard/BusquedaPuestosView";
import TallerDetailView from "@/components/dashboard/TallerDetailView";
import CVsView from "@/components/dashboard/CVsView";
import TalleresDisponiblesView from "@/components/dashboard/TalleresDisponiblesView";
import MisInscripcionesView from "@/components/dashboard/MisInscripcionesView";
import FeedbackParticipanteView from "@/components/dashboard/FeedbackParticipanteView";
import CompletarPerfilModal from "@/components/dashboard/CompletarPerfilModal";
import { type Taller } from "@/lib/api/talleres";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const [selectedTaller, setSelectedTaller] = useState<Taller | null>(null);
  const [showCompletarPerfil, setShowCompletarPerfil] = useState(false);

  // Determinar el rol del usuario (necesario antes de los efectos)
  const userRole = user?.roles?.[0] || "PARTICIPANTE";
  const isAdmin = userRole === "ADMIN";
  const isTrainer = userRole === "TRAINER";
  const isParticipante = userRole === "PARTICIPANTE";

  // Todos los hooks deben estar antes de los early returns
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  // Verificar si el PARTICIPANTE necesita completar su perfil
  useEffect(() => {
    if (isParticipante && user && !user.participanteId && !isLoading) {
      setShowCompletarPerfil(true);
    }
  }, [isParticipante, user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: "Talleres Activos",
      value: "12",
      description: "En curso este mes",
      icon: GraduationCap,
    },
    {
      title: "Talleres Totales",
      value: "45",
      description: "Todos los talleres",
      icon: GraduationCap,
    },
    {
      title: "Búsquedas Realizadas",
      value: "128",
      description: "Puestos analizados",
      icon: Search,
    },
    {
      title: "Competencias Identificadas",
      value: "1,234",
      description: "Total de competencias",
      icon: Search,
    },
  ];

  const handlePerfilCompletado = async () => {
    try {
      // Actualizar el usuario para obtener el nuevo participanteId
      await updateUser();
      setShowCompletarPerfil(false);
      // Recargar la página para actualizar el estado
      router.refresh();
    } catch (error) {
      console.error('Error actualizando usuario después de completar perfil:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  // Stats diferentes según el rol
  const adminStats = [
    {
      title: "Talleres Activos",
      value: "12",
      description: "En curso este mes",
      icon: GraduationCap,
    },
    {
      title: "Talleres Totales",
      value: "45",
      description: "Todos los talleres",
      icon: GraduationCap,
    },
    {
      title: "Búsquedas Realizadas",
      value: "128",
      description: "Puestos analizados",
      icon: Search,
    },
    {
      title: "Competencias Identificadas",
      value: "1,234",
      description: "Total de competencias",
      icon: Search,
    },
  ];

  const trainerStats = [
    {
      title: "Sesiones Programadas",
      value: "24",
      description: "Este mes",
      icon: Calendar,
    },
    {
      title: "Asistencias Tomadas",
      value: "156",
      description: "Total registradas",
      icon: FileCheck,
    },
    {
      title: "Participantes",
      value: "89",
      description: "Activos",
      icon: Users,
    },
    {
      title: "Feedbacks Recibidos",
      value: "67",
      description: "En total",
      icon: MessageSquare,
    },
  ];

  const participanteStats = [
    {
      title: "CVs Subidos",
      value: "3",
      description: "Total",
      icon: FileText,
    },
    {
      title: "Talleres Inscritos",
      value: "5",
      description: "Activos",
      icon: GraduationCap,
    },
    {
      title: "Feedbacks Dados",
      value: "2",
      description: "En total",
      icon: MessageSquare,
    },
    {
      title: "Talleres Disponibles",
      value: "12",
      description: "Para inscribirse",
      icon: Search,
    },
  ];

  const displayStats = isAdmin 
    ? adminStats 
    : isTrainer 
    ? trainerStats 
    : participanteStats;

  return (
    <div className="min-h-screen bg-background">
      {/* Modal para completar perfil de PARTICIPANTE */}
      {isParticipante && (
        <CompletarPerfilModal
          open={showCompletarPerfil}
          onComplete={handlePerfilCompletado}
        />
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Sistema de Talleres</h1>
              <p className="text-sm text-muted-foreground">
                {isAdmin 
                  ? "Panel de Administración" 
                  : isTrainer 
                  ? "Panel de Trainer" 
                  : "Panel de Participante"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <Shield className="w-3 h-3" />
              {userRole}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs - Diferentes según el rol */}
        {isAdmin ? (
          <Tabs defaultValue="workshops" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="workshops" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Talleres
              </TabsTrigger>
              <TabsTrigger value="job-search" className="gap-2">
                <Search className="w-4 h-4" />
                Búsqueda de Puestos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workshops" className="space-y-4">
              <TalleresView />
            </TabsContent>

            <TabsContent value="job-search" className="space-y-4">
              <BusquedaPuestosView />
            </TabsContent>
          </Tabs>
        ) : isTrainer ? (
          selectedTaller ? (
            <TallerDetailView 
              tallerId={selectedTaller.id} 
              onBack={() => setSelectedTaller(null)} 
            />
          ) : (
            <TalleresView onTallerClick={(taller) => setSelectedTaller(taller)} />
          )
        ) : isParticipante ? (
          <Tabs defaultValue="cvs" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="cvs" className="gap-2">
                <FileText className="w-4 h-4" />
                Mis CVs
              </TabsTrigger>
              <TabsTrigger value="talleres" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Talleres Disponibles
              </TabsTrigger>
              <TabsTrigger value="inscripciones" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Mis Inscripciones
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cvs" className="space-y-4">
              <CVsView />
            </TabsContent>

            <TabsContent value="talleres" className="space-y-4">
              <TalleresDisponiblesView />
            </TabsContent>

            <TabsContent value="inscripciones" className="space-y-4">
              <MisInscripcionesView />
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <FeedbackParticipanteView />
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No tienes permisos para acceder a esta sección
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
