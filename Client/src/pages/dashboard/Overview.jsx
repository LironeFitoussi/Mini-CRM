// src/pages/dashboard/Overview.jsx
import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Link } from "react-router-dom"; // Import du composant Link
import MainInfoContainer from "../../components/MainInfoContainer";
import { fetchAllNotifications } from "../../api/notifications";

// Fonction pour obtenir la couleur basée sur le rôle de l'utilisateur
const getColorByRole = (role) => {
  switch (role.toLowerCase()) {
    case "developer":
      return "#1976d2"; // Bleu
    case "admin":
      return "#d32f2f"; // Rouge
    case "user":
      return "#388e3c"; // Vert
    default:
      return "#757575"; // Gris pour les rôles non définis
  }
};

// Fonction pour formater les dates en français
const formatDateFR = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("fr-FR", options);
};

// Fonction pour générer les messages de notification en français
const generateFrenchMessage = (notification) => {
  if (notification.type === "callback") {
    const donatorName = notification.donator
      ? `${notification.donator.fName} ${notification.donator.lName}`
      : "Inconnu";
    const callbackDate = notification.notificationDate
      ? formatDateFR(notification.notificationDate)
      : "Date inconnue";

    return `Nous devons rappeler le donateur ${donatorName} le ${callbackDate}.`;
  }

  // Pour d'autres types de notifications, retourner le titre
  return notification.title;
};

const DashboardOverview = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchAllNotifications()
      .then((data) => {
        setNotifications(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des notifications :", error);
      });
  }, []);

  const getInitials = (fName, lName) => {
    return fName.charAt(0).toUpperCase() + lName.charAt(0).toUpperCase();
  };

  const getFullName = (fName, lName) => {
    return `${fName} ${lName}`;
  };

  return (
    <Container sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 6 }}>
      <MainInfoContainer />

      {/* Notifications Récentes */}
      <Paper sx={{ mt: 8, p: 3, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Notifications Récentes
        </Typography>
        <List>
          {notifications.map((notification) => (
            <ListItem
              key={notification._id}
              alignItems="flex-start"
              component={Link} // Transformation du ListItem en un lien
              to={`/dashboard/donors/${notification.donatorId}`} // Destination du lien
              secondaryAction={
                notification.isRead && <CheckCircleIcon color="success" />
              }
              sx={{ textDecoration: "none", color: "inherit" }} // Suppression de la décoration de texte par défaut et hérité des couleurs
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor:
                      notification.user && notification.user.role
                        ? getColorByRole(notification.user.role)
                        : getColorByRole("user"), // Par défaut à 'user' si le rôle est manquant
                  }}
                >
                  {notification.user &&
                    getInitials(notification.user.fName, notification.user.lName)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ fontWeight: "bold" }}
                    >
                      {notification.user
                        ? getFullName(notification.user.fName, notification.user.lName)
                        : "Utilisateur Inconnu"}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {generateFrenchMessage(notification)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default DashboardOverview;
