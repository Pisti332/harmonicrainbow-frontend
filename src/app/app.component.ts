import { Component } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DescriptionComponent } from "./description/description.component"
import { AnalyzeComponent } from './analyze/analyze.component';
import { EditComponent } from './edit/edit.component';
import _ from './login/images.download';

type Image = { name: string };
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent,
    RegisterComponent, DescriptionComponent, AnalyzeComponent,
    EditComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  IMAGE_URL = "/api/image";
  title = 'harmonicrainbow-front-end';
  login: boolean = false;
  register: boolean = false;
  isLoggedIn: boolean = false;
  token: string = '';
  email: string = '';
  images: Array<Image> = [];
  descriptionState: string | null = null;
  isAnalyzeWorkbench: boolean = false;
  isEditWorkbench: boolean = false;
  currentImageURL: string = "assets/img/root-template.jpg";
  currentImageName: string = "";
  page: number = 0;
  blob: Blob | undefined;

  setToken(token: string) {
    this.token = token;
  }

  updateImage(image: Blob) {
    this.currentImageURL = URL.createObjectURL(image);
  }

  async changeImages(direction: String) {
    if (direction === "L" && this.page !== 0) {
      this.page--;
    }
    else if (direction === "R" && this.page !== this.images.length - 1) {
      this.page++;
    }
    const image = await _.downloadImage(this.IMAGE_URL, this.email, this.images[this.page].name, this.token);
    const blob = await image.blob();
    this.blob = blob;
    this.currentImageName = this.images[this.page].name;
    this.currentImageURL = URL.createObjectURL(blob);
  }
  async setImages(images: Promise<any>) {
    const response = await images;
    const body = await response.json();
    this.images = body;
    this.changeImages("");
  }

  setEmail(email: string) {
    this.email = email;
  }
  disableLogin() {
    this.login = false;
  }
  triggerLogin(): void {
    this.login = true;
  }
  triggerRegister(): void {
    this.register = true;
  }
  hidePopUps(): void {
    this.login = false;
    this.register = false;
  }
  setIsLoggedIn(isLoggedIn: boolean): void {
    this.isLoggedIn = isLoggedIn;
  }
  logout(): void {
    this.token = '';
    this.setIsLoggedIn(false);
  }
  async uploadImage(event: any): Promise<void> {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("email", this.email);
      await fetch(this.IMAGE_URL, {
        method: "POST",
        "headers": {
          "Authorization": this.token
        },
        "body": formData
      });
      const response = await _.downloadImages(this.IMAGE_URL, "/" + this.email, this.token);
      this.images = await response.json();
    }
  }
  setDescription(state: string | null): void {
    if (this.isLoggedIn && state == 'analyze') {
      this.isEditWorkbench = false;
      this.isAnalyzeWorkbench = true;
    }
    else if (this.isLoggedIn && state == 'edit') {
      this.isAnalyzeWorkbench = false;
      this.isEditWorkbench = true;
    }
    else {
      this.descriptionState = state;
    }
  }
  disableWorkbenches() {
    this.isAnalyzeWorkbench = false;
    this.isEditWorkbench = false;
  }
  // todo make sure submit button disables login popup
}