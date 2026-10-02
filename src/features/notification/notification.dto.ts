import { AuditeDto } from "@/types/audite";

export interface NotificationDTO extends AuditeDto {
  id: number;
  time: string;
  app: string;
  title: string;
  title_big: string;
  text: string;
  sub_text: string;
  summary_text: string;
  big_text: string;
  audio_contents_uri: string;
  image_background_uri: string;
  extra_info_text: string;
  icon: string;
  image: string;
  icon_large: string;
}
