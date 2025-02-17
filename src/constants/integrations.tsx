import Image from "next/image";

type Props = {
  title: string;
  icon: React.ReactNode;
  description: string;
  strategy: "INSTAGRAM" | "CRM";
  buttonText: string;
  onConnect: () => Promise<void>;
};

export const INTEGRATION_CARDS: Props[] = [
  {
    title: "Connect Instagram",
    description: "Integrate your Instagram account to reach your audience",
    icon: <Image src="/icons/Instagram.svg" alt="Instagram" width={40} height={40} />,
    strategy: "INSTAGRAM",
    buttonText: "Connect Instagram",
    onConnect: async () => {
      // TODO: Implement Instagram connection logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    title: "Connect Messenger",
    description: "Connect with Facebook Messenger to engage with customers",
    icon: <Image src="/icons/messenger.svg" alt="Messenger" width={40} height={40} />,
    strategy: "CRM",
    buttonText: "Connect Messenger",
    onConnect: async () => {
      // TODO: Implement Messenger connection logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    title: "Connect Threads",
    description: "Expand your reach through Threads integration",
    icon: <Image src="/icons/threads.svg" alt="Threads" width={40} height={40} />,
    strategy: "CRM",
    buttonText: "Connect Threads",
    onConnect: async () => {
      // TODO: Implement Threads connection logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    title: "Connect Newsletter",
    description: "Engage your audience through email newsletters",
    icon: <Image src="/icons/email.png" alt="Newsletter" width={40} height={40} />,
    strategy: "CRM",
    buttonText: "Connect Newsletter",
    onConnect: async () => {
      // TODO: Implement Newsletter connection logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
];