import { NotificationDTO } from "./notification.dto";
import { Notification } from "./notification.types";

export const NotificationMapper = {
  toDomain(dto: NotificationDTO): Notification {
    return {
      id: dto.id,
      time: dto.time,
      app: dto.app,
      title: dto.title,
      titleBig: dto.title_big,
      text: dto.text,
      subText: dto.sub_text,
      summaryText: dto.summary_text,
      bigText: dto.big_text,
      audioContentsURI: dto.audio_contents_uri,
      imageBackgroundURI: dto.image_background_uri,
      extraInfoText: dto.extra_info_text,
      icon: dto.icon,
      image: dto.image,
      iconLarge: dto.icon_large,
      //Audit data
      createAt: dto.creat_at,
      updateAt: dto.update_at,
      createBy: dto.create_by,
      updateBy: dto.update_by,
    };
  },
  toDto(domain: Notification): NotificationDTO {
    return {
      id: domain.id,
      time: domain.time,
      app: domain.app,
      title: domain.title,
      title_big: domain.titleBig,
      text: domain.text,
      sub_text: domain.subText,
      summary_text: domain.summaryText,
      big_text: domain.bigText,
      audio_contents_uri: domain.audioContentsURI,
      image_background_uri: domain.imageBackgroundURI,
      extra_info_text: domain.extraInfoText,
      icon: domain.icon,
      image: domain.image,
      icon_large: domain.iconLarge,
      //audit data
      creat_at: domain.createAt,
      update_at: domain.updateAt,
      create_by: domain.createBy,
      update_by: domain.updateBy,
    };
  },
};
