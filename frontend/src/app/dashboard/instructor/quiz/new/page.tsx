'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  message
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface Option {
  text: string;
}

interface Question {
  prompt: string;
  options: Option[];
  correctIndex?: number;
}

export default function InstructorCreateQuizPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      // TODO: call backend API to persist quiz
      // await axios.post(`${API_URL}/instructor/quizzes`, values);
      console.log('Quiz payload', values);
      message.success('Đã tạo quiz (mock).');
      form.resetFields();
    } catch (error) {
      message.error('Tạo quiz thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex vertical gap={16} style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
      <Card>
        <Title level={3} style={{ marginBottom: 4 }}>Tạo quiz cho khóa học</Title>
        <Paragraph type="secondary">Nhập thông tin chung và danh sách câu hỏi.</Paragraph>
      </Card>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ questions: [{ options: [{ text: '' }, { text: '' }] }] }}
        >
          <Form.Item name="title" label="Tên quiz" rules={[{ required: true, message: 'Nhập tên quiz' }]}>
            <Input placeholder="Ví dụ: Quiz Chương 1" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Tóm tắt nội dung quiz" />
          </Form.Item>

          <Form.Item name="duration" label="Thời lượng (phút)">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="10" />
          </Form.Item>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                {fields.map((field, qIndex) => (
                  <Card
                    key={field.key}
                    type="inner"
                    title={`Câu hỏi ${qIndex + 1}`}
                    extra={
                      fields.length > 1 ? (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      ) : null
                    }
                  >
                    <Form.Item
                      name={[field.name, 'prompt']}
                      label="Nội dung"
                      rules={[{ required: true, message: 'Nhập nội dung câu hỏi' }]}
                    >
                      <Input.TextArea rows={2} placeholder="Nội dung câu hỏi" />
                    </Form.Item>

                    <Form.List name={[field.name, 'options']}>
                      {(optionFields, optionOps) => (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {optionFields.map((optField, optIndex) => (
                            <Flex key={optField.key} align="center" gap={8}>
                              <Form.Item
                                style={{ flex: 1, marginBottom: 8 }}
                                name={[optField.name, 'text']}
                                rules={[{ required: true, message: 'Nhập đáp án' }]}
                              >
                                <Input placeholder={`Đáp án ${optIndex + 1}`} />
                              </Form.Item>
                              {optionFields.length > 2 && (
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => optionOps.remove(optField.name)}
                                />
                              )}
                            </Flex>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => optionOps.add({ text: '' })}
                          >
                            Thêm đáp án
                          </Button>
                        </Space>
                      )}
                    </Form.List>

                    <Form.Item
                      name={[field.name, 'correctIndex']}
                      label="Đáp án đúng (chỉ số)"
                      rules={[{ required: true, message: 'Nhập chỉ số đáp án đúng (bắt đầu từ 0)' }]}
                    >
                      <InputNumber min={0} style={{ width: 200 }} placeholder="0" />
                    </Form.Item>
                  </Card>
                ))}

                <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ options: [{ text: '' }, { text: '' }] })}>
                  Thêm câu hỏi
                </Button>
              </Space>
            )}
          </Form.List>

          <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
            <Button htmlType="reset">Làm lại</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Tạo quiz (mock)
            </Button>
          </Flex>
        </Form>
      </Card>
    </Flex>
  );
}
