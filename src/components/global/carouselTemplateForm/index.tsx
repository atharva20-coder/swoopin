import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCarouselTemplate } from "@/actions/automations";
import { toast } from "sonner";
import { Trash, Plus, Image } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { CarouselElement, CarouselButton, ButtonType, CarouselTemplateFormProps } from "@/types/carousel.types";
import { carouselTemplateSchema } from "@/schemas/carousel.schema";

type Props = {
  automationId: string;
  onSuccess: (elements: CarouselElement[], templateId: string) => void;
};

export default function CarouselTemplateForm({ automationId, onSuccess }: Props) {
  const [elements, setElements] = useState<CarouselElement[]>([
    {
      title: "",
      subtitle: "",
      imageUrl: "",
      buttons: [{ type: "WEB_URL", title: "", url: "" }]
    }
  ]);
  const [loading, setLoading] = useState(false);

  const addElement = () => {
    if (elements.length >= 10) {
      toast.error("Maximum 10 elements allowed");
      return;
    }
    setElements([...elements, {
      title: "",
      subtitle: "",
      imageUrl: "",
      buttons: [{ type: "WEB_URL", title: "", url: "" }]
    }]);
  };

  const removeElement = (index: number) => {
    if (elements.length <= 1) {
      toast.error("At least one element is required");
      return;
    }
    setElements(elements.filter((_, i) => i !== index));
  };

  const addButton = (elementIndex: number) => {
    const updatedElements = [...elements];
    if (updatedElements[elementIndex].buttons.length >= 3) {
      toast.error("Maximum 3 buttons per element allowed");
      return;
    }
    updatedElements[elementIndex].buttons.push({ type: "WEB_URL", title: "", url: "" });
    setElements(updatedElements);
  };

  const removeButton = (elementIndex: number, buttonIndex: number) => {
    const updatedElements = [...elements];
    if (updatedElements[elementIndex].buttons.length <= 1) {
      toast.error("At least one button is required");
      return;
    }
    updatedElements[elementIndex].buttons = updatedElements[elementIndex].buttons.filter((_, i) => i !== buttonIndex);
    setElements(updatedElements);
  };

  const updateElement = (index: number, field: keyof CarouselElement, value: string) => {
    const updatedElements = [...elements];
    updatedElements[index] = { ...updatedElements[index], [field]: value };
    setElements(updatedElements);
  };

  const updateButton = (elementIndex: number, buttonIndex: number, field: keyof CarouselButton, value: string) => {
    const updatedElements = [...elements];
    updatedElements[elementIndex].buttons[buttonIndex] = { 
      ...updatedElements[elementIndex].buttons[buttonIndex], 
      [field]: value 
    };
    setElements(updatedElements);
  };

  const updateButtonType = (elementIndex: number, buttonIndex: number, type: ButtonType) => {
    const updatedElements = [...elements];
    // Reset url/payload when changing type
    if (type === "WEB_URL") {
      updatedElements[elementIndex].buttons[buttonIndex] = { 
        type, 
        title: updatedElements[elementIndex].buttons[buttonIndex].title,
        url: ""
      };
    } else {
      updatedElements[elementIndex].buttons[buttonIndex] = { 
        type, 
        title: updatedElements[elementIndex].buttons[buttonIndex].title,
        payload: ""
      };
    }
    setElements(updatedElements);
  };

  const handleSubmit = async () => {
    // Validate form using Zod schema
    const result = carouselTemplateSchema.safeParse(elements);
    if (!result.success) {
      // Display the first validation error
      const error = result.error.errors[0];
      toast.error(error.message);
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await createCarouselTemplate(automationId, elements);
      
      if (response.status === 200 && response.templateId) {
        toast.success(response.data);
        // Pass both elements and template ID to parent
        onSuccess(elements, response.templateId);
        // Reset form
        setElements([{
          title: "",
          subtitle: "",
          imageUrl: "",
          buttons: [{ type: "WEB_URL", title: "", url: "" }]
        }]);
      }
    } catch (error) {
      console.error('Error creating carousel template:', error);
      toast.error('Failed to create carousel template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-black dark:text-white text-xl font-semibold">Create Carousel Template</h2>
        <Button onClick={addElement} size="sm" variant="outline" className="text-black dark:text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Element
        </Button>
      </div>
      
      <div className="space-y-6">
        {elements.map((element, elementIndex) => (
          <Card key={elementIndex}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-md">Element {elementIndex + 1}</CardTitle>
              <Button 
                onClick={() => removeElement(elementIndex)} 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`title-${elementIndex}`}>Title <span className="text-red-500">*</span></Label>
                <Input
                  id={`title-${elementIndex}`}
                  value={element.title}
                  onChange={(e) => updateElement(elementIndex, "title", e.target.value)}
                  placeholder="Element title (required)"
                  maxLength={80}
                />
                <p className="text-xs text-muted-foreground">{element.title.length}/80 characters</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`subtitle-${elementIndex}`}>Subtitle</Label>
                <Input
                  id={`subtitle-${elementIndex}`}
                  value={element.subtitle || ""}
                  onChange={(e) => updateElement(elementIndex, "subtitle", e.target.value)}
                  placeholder="Element subtitle (optional)"
                  maxLength={80}
                />
                <p className="text-xs text-muted-foreground">{(element.subtitle?.length || 0)}/80 characters</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`image-${elementIndex}`}>Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id={`image-${elementIndex}`}
                    value={element.imageUrl || ""}
                    onChange={(e) => updateElement(elementIndex, "imageUrl", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0" 
                    aria-label="Select image"
                  >
                    <Image className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`default-action-${elementIndex}`}>Default Action URL</Label>
                <Input
                  id={`default-action-${elementIndex}`}
                  value={element.defaultAction || ""}
                  onChange={(e) => updateElement(elementIndex, "defaultAction", e.target.value)}
                  placeholder="https://example.com"
                />
                <p className="text-xs text-muted-foreground">URL to navigate when the carousel element is clicked</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Buttons</Label>
                  <Button 
                    onClick={() => addButton(elementIndex)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Button
                  </Button>
                </div>
                
                {element.buttons.map((button, buttonIndex) => (
                  <div key={buttonIndex} className="space-y-3 p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <Label>Button {buttonIndex + 1}</Label>
                      <Button 
                        onClick={() => removeButton(elementIndex, buttonIndex)} 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`button-title-${elementIndex}-${buttonIndex}`}>Button Text <span className="text-red-500">*</span></Label>
                      <Input
                        id={`button-title-${elementIndex}-${buttonIndex}`}
                        value={button.title}
                        onChange={(e) => updateButton(elementIndex, buttonIndex, "title", e.target.value)}
                        placeholder="Button text (required)"
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">{button.title.length}/20 characters</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`button-type-${elementIndex}-${buttonIndex}`}>Button Type</Label>
                      <Select
                        value={button.type}
                        onValueChange={(value: ButtonType) => updateButtonType(elementIndex, buttonIndex, value)}
                      >
                        <SelectTrigger id={`button-type-${elementIndex}-${buttonIndex}`}>
                          <SelectValue placeholder="Select button type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WEB_URL">Web URL</SelectItem>
                          <SelectItem value="POSTBACK">Postback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {button.type === "WEB_URL" ? (
                      <div className="space-y-2">
                        <Label htmlFor={`button-url-${elementIndex}-${buttonIndex}`}>URL <span className="text-red-500">*</span></Label>
                        <Input
                          id={`button-url-${elementIndex}-${buttonIndex}`}
                          value={button.url || ""}
                          onChange={(e) => updateButton(elementIndex, buttonIndex, "url", e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor={`button-payload-${elementIndex}-${buttonIndex}`}>Payload <span className="text-red-500">*</span></Label>
                        <Input
                          id={`button-payload-${elementIndex}-${buttonIndex}`}
                          value={button.payload || ""}
                          onChange={(e) => updateButton(elementIndex, buttonIndex, "payload", e.target.value)}
                          placeholder="PAYLOAD_IDENTIFIER"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" 
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Carousel Template"}
      </Button>
    </div>
  );
}