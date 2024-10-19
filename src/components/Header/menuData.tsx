import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Cerca Corsi",
    path: "/corsi",
    newTab: false,
  },
  {
    id: 2, title: "Discipline", newTab: false, submenu: []
  },
  {
    id: 3, title: "Città", newTab: false, submenu: [],
  },
  {
    id: 4, title: "Università", newTab: false, submenu: [],
  },
];
export default menuData;
