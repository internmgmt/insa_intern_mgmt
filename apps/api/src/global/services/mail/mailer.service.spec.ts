import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

jest.mock('nodemailer');

const TEST_SMTP_USER = process.env.TEST_SMTP_USER || 'smtp-user';
const TEST_SMTP_PASS = process.env.TEST_SMTP_PASS || 'smtp-pass';
const TEST_SMTP_HOST = process.env.TEST_SMTP_HOST || 'smtp-host';
const TEST_SMTP_PORT = Number(process.env.TEST_SMTP_PORT) || 123;
const TEST_MAIL_FROM = process.env.TEST_MAIL_FROM || 'from-mail';

describe('MailerService', () => {
  let service: MailService;
  const connectMock = jest.mocked(createTransport);
  const sendMock = jest.fn().mockResolvedValue({ response: 'mock-response' });

  beforeEach(async () => {
    connectMock.mockReturnValueOnce({
      sendMail: sendMock,
    } as unknown as Transporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              from: TEST_MAIL_FROM,
              transportOptions: {
                host: TEST_SMTP_HOST,
                port: TEST_SMTP_PORT,
                auth: {
                  user: TEST_SMTP_USER,
                  pass: TEST_SMTP_PASS,
                },
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to SMTP', () => {
    const connectMock = jest.mocked(createTransport);

    expect(connectMock).toHaveBeenCalledWith({
      host: TEST_SMTP_HOST,
      port: TEST_SMTP_PORT,
      auth: {
        user: TEST_SMTP_USER,
        pass: TEST_SMTP_PASS,
      },
    });
  });

  it('should send mail according to options', async () => {
    const sendOptions = {
      to: 'to-mail@example.com',
      from: service.from(),
      subject: 'User registered',
    };
    const mailResult = await service.send(sendOptions);

    expect(mailResult).toBe('mock-response');
    expect(sendMock).toHaveBeenCalledWith(sendOptions);
  });

  it('should return from mail', () => {
    expect(service.from()).toBe(TEST_MAIL_FROM);
  });
});
