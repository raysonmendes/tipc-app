import { Audite } from "@/types/audite";

export interface Notification extends Audite {
  id: number;
  time: string;
  app: string;
  title: string;
  titleBig: string;
  text: string;
  subText: string;
  summaryText: string;
  bigText: string;
  audioContentsURI: string;
  imageBackgroundURI: string;
  extraInfoText: string;
  icon: string;
  image: string;
  iconLarge: string;
}

export interface RawNotificationsListProps {
  notifications: Notification[];
  onCopy: (notification: Notification) => Promise<void>;
}
