"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Search, LogOut, Shield, MessageSquare, FileText, BookOpen, BarChart3, QrCode, Users, Bell, Calendar } from "lucide-react";
import TalleresView from "@/components/dashboard/TalleresView";
import BusquedaPuestosView from "@/components/dashboard/BusquedaPuestosView";
import TallerDetailView from "@/components/dashboard/TallerDetailView";
import CVsView from "@/components/dashboard/CVsView";
import TalleresDisponiblesView from "@/components/dashboard/TalleresDisponiblesView";
import MisInscripcionesView from "@/components/dashboard/MisInscripcionesView";
import MisSesionesView from "@/components/dashboard/MisSesionesView";
import FeedbackParticipanteView from "@/components/dashboard/FeedbackParticipanteView";
import CompletarPerfilModal from "@/components/dashboard/CompletarPerfilModal";
import DashboardEjecutivo from "@/components/dashboard/DashboardEjecutivo";
import TrainersView from "@/components/dashboard/TrainersView";
import NotificacionesView from "@/components/dashboard/NotificacionesView";
import NotificacionesBadge from "@/components/dashboard/NotificacionesBadge";
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
            <NotificacionesBadge />
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
        {/* Main Content Tabs - Diferentes según el rol */}
        {isAdmin ? (
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="workshops" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Talleres
              </TabsTrigger>
              <TabsTrigger value="trainers" className="gap-2">
                <Users className="w-4 h-4" />
                Trainers
              </TabsTrigger>
              <TabsTrigger value="job-search" className="gap-2">
                <Search className="w-4 h-4" />
                Búsqueda de Puestos
              </TabsTrigger>
              <TabsTrigger value="notificaciones" className="gap-2">
                <Bell className="w-4 h-4" />
                Notificaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <DashboardEjecutivo />
            </TabsContent>

            <TabsContent value="workshops" className="space-y-4">
              <TalleresView />
            </TabsContent>

            <TabsContent value="trainers" className="space-y-4">
              <TrainersView />
            </TabsContent>

            <TabsContent value="job-search" className="space-y-4">
              <BusquedaPuestosView />
            </TabsContent>

            <TabsContent value="notificaciones" className="space-y-4">
              <NotificacionesView />
            </TabsContent>
          </Tabs>
        ) : isTrainer ? (
          <Tabs defaultValue="talleres" className="space-y-6">
            <TabsList className="bg-muted">
              <TabsTrigger value="talleres" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                Mis Talleres
              </TabsTrigger>
              <TabsTrigger value="notificaciones" className="gap-2">
                <Bell className="w-4 h-4" />
                Notificaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="talleres" className="space-y-4">
              {selectedTaller ? (
                <TallerDetailView 
                  tallerId={selectedTaller.id} 
                  onBack={() => setSelectedTaller(null)} 
                />
              ) : (
                <TalleresView onTallerClick={(taller) => setSelectedTaller(taller)} />
              )}
            </TabsContent>

            <TabsContent value="notificaciones" className="space-y-4">
              <NotificacionesView />
            </TabsContent>
          </Tabs>
        ) : isParticipante ? (
          <Tabs defaultValue="cvs" className="space-y-6">
            <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4">
              <TabsList className="bg-muted min-w-fit inline-flex">
                <TabsTrigger value="cvs" className="gap-1 sm:gap-2 flex-shrink-0 px-3 sm:px-4">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">CVs</span>
                </TabsTrigger>
                <TabsTrigger value="talleres" className="gap-1 sm:gap-2 flex-shrink-0 px-3 sm:px-4">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Talleres</span>
                </TabsTrigger>
                <TabsTrigger value="inscripciones" className="gap-1 sm:gap-2 flex-shrink-0 px-3 sm:px-4">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Inscripciones</span>
                </TabsTrigger>
                <TabsTrigger value="sesiones" className="gap-1 sm:gap-2 flex-shrink-0 px-3 sm:px-4">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Sesiones</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="gap-1 sm:gap-2 flex-shrink-0 px-3 sm:px-4">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Feedback</span>
                </TabsTrigger>
                <TabsTrigger value="notificaciones" className="gap-1 sm:gap-2 flex-shrink-0 px-3 sm:px-4">
                  <Bell className="w-4 h-4" />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Notificaciones</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cvs" className="space-y-4">
              <CVsView />
            </TabsContent>

            <TabsContent value="talleres" className="space-y-4">
              <TalleresDisponiblesView />
            </TabsContent>

            <TabsContent value="inscripciones" className="space-y-4">
              <MisInscripcionesView />
            </TabsContent>

            <TabsContent value="sesiones" className="space-y-4">
              <MisSesionesView />
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <FeedbackParticipanteView />
            </TabsContent>

            <TabsContent value="notificaciones" className="space-y-4">
              <NotificacionesView />
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
