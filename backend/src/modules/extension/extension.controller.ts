import { Request, Response } from 'express';
import { ExtensionService } from './extension.service';

export class ExtensionController {
  private service: ExtensionService;

  constructor() {
    this.service = new ExtensionService();
  }

  public heartbeat = async (req: Request, res: Response) => {
    try {
      const payload = req.body; // In real implementation, this comes from verified JWT token + body
      const result = await this.service.handleHeartbeat(payload);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public statusChange = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const result = await this.service.handleStatusChange(payload);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public idleStart = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const result = await this.service.handleIdleStart(payload);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
