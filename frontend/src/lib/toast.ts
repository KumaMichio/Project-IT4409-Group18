import { message } from 'antd';

export const toast = {
  success: (content: string, duration: number = 3) => {
    message.success(content, duration);
  },
  error: (content: string, duration: number = 4) => {
    message.error(content, duration);
  },
  warning: (content: string, duration: number = 3) => {
    message.warning(content, duration);
  },
  info: (content: string, duration: number = 3) => {
    message.info(content, duration);
  },
  loading: (content: string, duration: number = 0) => {
    return message.loading(content, duration);
  },
};

